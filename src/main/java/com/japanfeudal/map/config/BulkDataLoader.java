package com.japanfeudal.map.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.japanfeudal.map.model.*;
import com.japanfeudal.map.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.*;

@Component
public class BulkDataLoader implements CommandLineRunner {

    private final ClanRepository clanRepo;
    private final WarriorRepository warriorRepo;
    private final BattleRepository battleRepo;
    private final ProvinceRepository provinceRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public BulkDataLoader(ClanRepository clanRepo, WarriorRepository warriorRepo,
                          BattleRepository battleRepo, ProvinceRepository provinceRepo) {
        this.clanRepo = clanRepo;
        this.warriorRepo = warriorRepo;
        this.battleRepo = battleRepo;
        this.provinceRepo = provinceRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        loadClansFull();
        // Limpiar guerreros generados de ejecuciones previas (p. ej. "<Clan> Retainer")
        removeGeneratedRetainers();
        loadWarriors();       // tu archivo warriors.json existente
        loadBattles();        // tu archivo battles.json existente
        ensureClanHasWarriors();
        // Eliminar cualquier "Retainer" creado durante esta carga
        removeGeneratedRetainers();
        loadProvincesGeoJson(); // provinces.geojson extendido
        System.out.println("[BulkDataLoader] Done. Clans=" + clanRepo.count()
                + " Warriors=" + warriorRepo.count()
                + " Battles=" + battleRepo.count()
                + " Provinces=" + provinceRepo.count());
    }

    private InputStream resource(String path) {
        try {
            ClassPathResource r = new ClassPathResource(path);
            return r.exists() ? r.getInputStream() : null;
        } catch (Exception e) {
            return null;
        }
    }
    private String text(JsonNode n, String field) {
        return (n != null && n.has(field) && !n.get(field).isNull()) ? n.get(field).asText() : "";
    }

    // NUEVO: ingesta de todos los clanes con ubicación
    private void loadClansFull() {
        try (InputStream is = resource("data/clans_full.json")) {
            if (is == null) {
                System.out.println("clans_full.json no encontrado, omitido.");
                return;
            }
            JsonNode arr = mapper.readTree(is);
            if (arr.isArray()) {
                for (JsonNode n : arr) {
                    String name = text(n, "name");
                    if (name.isBlank()) continue;
                    Clan c = clanRepo.findByNameIgnoreCase(name).orElse(new Clan());
                    c.setName(name);
                    c.setProvinceOrigin(text(n, "provinceOrigin"));
                    c.setEra(text(n, "era"));
                    c.setCrestUrl(text(n, "crestUrl"));
                    JsonNode loc = n.get("location");
                    if (loc != null && !loc.isNull()) {
                        c.setLocationGeoJson(loc.toString());
                    }
                    clanRepo.save(c);
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading clans_full.json: " + e.getMessage());
        }
    }

    // Implementación: carga guerreros, batallas y provincias desde los JSON de resources
    private void loadWarriors() {
        try (InputStream is = resource("data/warriors.json")) {
            if (is == null) return;
            JsonNode arr = mapper.readTree(is);
            if (arr.isArray()) {
                for (JsonNode n : arr) {
                    String name = text(n, "name");
                    if (name.isBlank()) continue;
                    String clanName = text(n, "clan");
                    Clan clan = null;
                    if (!clanName.isBlank()) clan = clanRepo.findByNameIgnoreCase(clanName).orElseGet(() -> {
                        Clan c = new Clan(); c.setName(clanName); return clanRepo.save(c);
                    });
                    // Evitar duplicados: buscar por nombre existente (case-insensitive)
                    Warrior w = warriorRepo.findByNameIgnoreCase(name).orElseGet(() -> new Warrior());
                    w.setName(name);
                    w.setEra(text(n, "era"));
                    w.setRole(text(n, "role"));
                    w.setBio(text(n, "bio"));
                    // Leer campo imageUrl si está presente
                    String imageUrl = text(n, "imageUrl");
                    if (imageUrl != null && !imageUrl.isBlank()) w.setImageUrl(imageUrl);
                    if (clan != null) w.setClan(clan);
                    warriorRepo.save(w);
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading warriors.json: " + e.getMessage());
        }
    }

    private void loadBattles() {
        try (InputStream is = resource("data/battles.json")) {
            if (is == null) return;
            JsonNode arr = mapper.readTree(is);
            if (arr.isArray()) {
                for (JsonNode n : arr) {
                    try {
                        String name = text(n, "name");
                        if (name.isBlank()) continue;
                        System.out.println("[BulkDataLoader] Loading battle: " + name);
                        Battle b = battleRepo.findByNameIgnoreCase(name).orElse(new Battle());
                        b.setName(name);
                        String dateText = text(n, "date");
                        try { if (!dateText.isBlank()) b.setDate(LocalDate.parse(dateText)); } catch (Exception ignored) {}
                        b.setEra(text(n, "era"));
                        JsonNode geom = n.get("geoJson");
                        if (geom != null && !geom.isNull()) b.setGeoJson(geom.toString());

                        // Leer imageUrl para la batalla
                        String bimg = text(n, "imageUrl");
                        if (bimg != null && !bimg.isBlank()) b.setImageUrl(bimg);

                        // Clear associations if updating an existing battle
                        if (b.getClans() != null) b.getClans().clear();
                        if (b.getWarriors() != null) b.getWarriors().clear();

                        JsonNode clansArr = n.get("clans");
                        if (clansArr != null && clansArr.isArray()) {
                            for (JsonNode cn : clansArr) {
                                String cname = cn.asText("");
                                if (cname.isBlank()) continue;
                                Clan c = clanRepo.findByNameIgnoreCase(cname).orElseGet(() -> {
                                    Clan cc = new Clan(); cc.setName(cname); return clanRepo.save(cc);
                                });
                                b.getClans().add(c);
                            }
                        }

                        // Warriors: link only existing warriors
                        JsonNode wars = n.get("warriors");
                        if (wars != null && wars.isArray()) {
                            for (JsonNode wn : wars) {
                                String wname = wn.asText("");
                                if (wname.isBlank()) continue;
                                warriorRepo.findByNameIgnoreCase(wname).ifPresent(b.getWarriors()::add);
                            }
                        }

                        battleRepo.save(b);
                    } catch (Exception e) {
                        System.err.println("[BulkDataLoader] Error loading a battle entry: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading battles.json: " + e.getMessage());
        }
    }

    private void loadProvincesGeoJson() {
        try (InputStream is = resource("data/provinces.geojson")) {
            if (is == null) return;
            JsonNode root = mapper.readTree(is);
            JsonNode features = root.get("features");
            if (features != null && features.isArray()) {
                for (JsonNode f : features) {
                    JsonNode props = f.get("properties");
                    if (props == null) continue;
                    String name = props.has("name") ? props.get("name").asText("") : "";
                    if (name.isBlank()) continue;
                    String clan = props.has("clan") ? props.get("clan").asText("") : "";
                    String era = props.has("era") ? props.get("era").asText("") : "";
                    Province p = new Province();
                    p.setName(name); p.setClan(clan); p.setEra(era);
                    p.setGeoJson(f.get("geometry") != null ? f.get("geometry").toString() : "");
                    provinceRepo.save(p);
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading provinces.geojson: " + e.getMessage());
        }
    }

    // Asegurar que cada clan tenga al menos un guerrero
    private void ensureClanHasWarriors() {
        try {
            for (Clan c : clanRepo.findAll()) {
                List<Warrior> ws = warriorRepo.findByClan_NameIgnoreCase(c.getName());
                if (ws == null || ws.isEmpty()) {
                    Warrior w = new Warrior();
                    w.setName(c.getName() + " Retainer");
                    w.setEra(c.getEra());
                    w.setRole("Samurai");
                    w.setBio("Guerrero generado automáticamente para el clan " + c.getName());
                    w.setClan(c);
                    warriorRepo.save(w);
                }
            }
        } catch (Exception e) {
            System.err.println("Error ensuring clan warriors: " + e.getMessage());
        }
    }

    // Elimina guerreros generados automáticamente cuyo nombre contiene "Retainer"
    private void removeGeneratedRetainers() {
        try {
            List<Warrior> all = warriorRepo.findAll();
            List<Warrior> toRemove = new ArrayList<>();
            for (Warrior w : all) {
                String n = w.getName();
                if (n == null) continue;
                if (n.endsWith(" Retainer") || n.contains("Retainer")) {
                    toRemove.add(w);
                }
            }
            if (!toRemove.isEmpty()) {
                warriorRepo.deleteAll(toRemove);
                System.out.println("[BulkDataLoader] Removed generated retainers: " + toRemove.size());
            }
        } catch (Exception e) {
            System.err.println("Error removing generated retainers: " + e.getMessage());
        }
    }
}
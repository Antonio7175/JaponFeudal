package com.japanfeudal.map.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import com.japanfeudal.map.model.Clan;
import com.japanfeudal.map.model.Province;
import com.japanfeudal.map.repository.ClanRepository;
import com.japanfeudal.map.repository.ProvinceRepository;
import com.japanfeudal.map.service.BattleService;
import com.japanfeudal.map.service.ProvinceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final ProvinceService provinceService;
    private final BattleService battleService;
    private final ProvinceRepository provinceRepo;
    private final ClanRepository clanRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public ApiController(ProvinceService provinceService,
                         BattleService battleService,
                         ProvinceRepository provinceRepo,
                         ClanRepository clanRepo) {
        this.provinceService = provinceService;
        this.battleService = battleService;
        this.provinceRepo = provinceRepo;
        this.clanRepo = clanRepo;
    }

    @GetMapping("/provinces")
    public ResponseEntity<JsonNode> getProvinces(
            @RequestParam(required = false) String clan,
            @RequestParam(required = false) String era,
            @RequestParam(required = false) String name
    ) {
        List<String> clans = clan == null || clan.isBlank() ? List.of()
                : Arrays.stream(clan.split(",")).map(String::trim).toList();
        List<String> eras  = era  == null || era.isBlank()  ? List.of()
                : Arrays.stream(era.split(",")).map(String::trim).toList();
        JsonNode base = provinceService.getFeatureCollectionMulti(clans, eras, name);
        // Añadir como features las ubicaciones de clanes que no estén ya representadas como provincia
        ArrayNode features = mapper.createArrayNode();
        if (base != null && base.has("features") && base.get("features").isArray()) {
            for (JsonNode f : base.get("features")) features.add(f);
        }
        Set<String> existingProvinceNames = new HashSet<>();
        for (JsonNode f : features) {
            JsonNode p = f.get("properties");
            if (p != null && p.has("name")) existingProvinceNames.add(p.get("name").asText(""));
        }
        for (Clan c : clanRepo.findAll()) {
            String prov = c.getProvinceOrigin();
            if (prov == null || prov.isBlank()) continue;
            if (existingProvinceNames.contains(prov)) continue;
            if (c.getLocationGeoJson() == null || c.getLocationGeoJson().isBlank()) continue;
            try {
                JsonNode geom = mapper.readTree(c.getLocationGeoJson());
                ObjectNode f = mapper.createObjectNode();
                f.put("type", "Feature");
                ObjectNode props = mapper.createObjectNode();
                props.put("name", prov);
                props.put("clan", c.getName());
                props.put("era", c.getEra());
                String crest = c.getCrestUrl();
                if (crest == null || crest.isBlank()) crest = generateCrestDataUri(c.getName());
                props.put("crestUrl", crest);
                f.set("properties", props);
                f.set("geometry", geom);
                features.add(f);
            } catch (Exception ignored) {}
        }
        ObjectNode fc = mapper.createObjectNode(); fc.put("type", "FeatureCollection"); fc.set("features", features);
        return ResponseEntity.ok(fc);
    }

    @GetMapping("/battles")
    public ResponseEntity<?> getBattles(
            @RequestParam(required = false) String clan,
            @RequestParam(required = false) String warrior,
            @RequestParam(required = false) Integer fromYear,
            @RequestParam(required = false) Integer toYear
    ) {
        List<com.japanfeudal.map.model.Battle> list = battleService.filter(clan, warrior, fromYear, toYear);
        ArrayNode arr = mapper.createArrayNode();
        for (com.japanfeudal.map.model.Battle b : list) {
            ObjectNode bn = mapper.createObjectNode();
            bn.put("id", b.getId());
            bn.put("name", b.getName());
            bn.put("era", b.getEra());
            bn.put("date", b.getDate() != null ? b.getDate().toString() : "");
            // devolver geoJson como objeto JSON cuando esté disponible, no como string
            try {
                if (b.getGeoJson() != null && !b.getGeoJson().isBlank()) {
                    JsonNode geom = mapper.readTree(b.getGeoJson());
                    bn.set("geoJson", geom);
                } else {
                    bn.put("geoJson", "");
                }
            } catch (Exception ex) {
                bn.put("geoJson", b.getGeoJson() != null ? b.getGeoJson() : "");
            }
            bn.put("imageUrl", b.getImageUrl() != null ? b.getImageUrl() : "");

            ArrayNode clansArr = mapper.createArrayNode();
            for (com.japanfeudal.map.model.Clan c : b.getClans()) {
                ObjectNode cn = mapper.createObjectNode();
                cn.put("name", c.getName());
                String crest = c.getCrestUrl();
                if (crest == null || crest.isBlank()) crest = generateCrestDataUri(c.getName());
                cn.put("crestUrl", crest);
                clansArr.add(cn);
            }
            bn.set("clans", clansArr);

            ArrayNode wars = mapper.createArrayNode();
            for (com.japanfeudal.map.model.Warrior w : b.getWarriors()) {
                ObjectNode wn = mapper.createObjectNode();
                wn.put("name", w.getName());
                wn.put("role", w.getRole());
                wn.put("era", w.getEra());
                wn.put("clan", w.getClan() != null ? w.getClan().getName() : "");
                wars.add(wn);
            }
            bn.set("warriors", wars);
            // Count for convenience
            bn.put("warriorCount", b.getWarriors() != null ? b.getWarriors().size() : 0);
            arr.add(bn);
        }
        return ResponseEntity.ok(arr);
    }

    // NUEVO: nombres de clanes para los selects del mapa
    @GetMapping("/clans")
    public List<String> clanNames() {
        Set<String> names = clanRepo.findAll().stream()
                .map(Clan::getName).filter(Objects::nonNull)
                .map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (names.isEmpty()) {
            names = provinceRepo.findAll().stream()
                    .map(Province::getClan).filter(Objects::nonNull)
                    .map(String::trim).filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return new ArrayList<>(names);
    }

    // NUEVO: nombres de eras
    @GetMapping("/eras")
    public List<String> eraNames() {
        Set<String> eras = provinceRepo.findAll().stream()
                .map(Province::getEra).filter(Objects::nonNull)
                .map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (eras.isEmpty()) {
            eras = clanRepo.findAll().stream()
                    .map(Clan::getEra).filter(Objects::nonNull)
                    .map(String::trim).filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return new ArrayList<>(eras);
    }

    // NUEVO: GeoJSON con TODOS los clanes como puntos
    @GetMapping("/clans/geo")
    public JsonNode clansGeo() {
        ArrayNode features = mapper.createArrayNode();
        for (Clan c : clanRepo.findAll()) {
            if (c.getLocationGeoJson() == null || c.getLocationGeoJson().isBlank()) continue;
            ObjectNode f = mapper.createObjectNode();
            f.put("type", "Feature");
            ObjectNode props = mapper.createObjectNode();
            props.put("name", c.getName());
            props.put("provinceOrigin", c.getProvinceOrigin());
            props.put("era", c.getEra());
            String crest = c.getCrestUrl();
            if (crest == null || crest.isBlank()) crest = generateCrestDataUri(c.getName());
            props.put("crestUrl", crest);
            f.set("properties", props);
            try {
                JsonNode geom = mapper.readTree(c.getLocationGeoJson());
                f.set("geometry", geom);
                features.add(f);
            } catch (Exception ignored) {}
        }
        ObjectNode fc = mapper.createObjectNode();
        fc.put("type", "FeatureCollection");
        fc.set("features", features);
        return fc;
    }

    private String generateCrestDataUri(String name) {
        String initial = (name != null && !name.isBlank()) ? name.substring(0,1).toUpperCase() : "?";
        int hash = Math.abs(Objects.hashCode(name));
        int hue = 30 + (hash % 300);
        String color = "hsl(" + hue + ",60%,40%)";
        String svg = "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
            "<circle cx='32' cy='32' r='28' fill='none' stroke='" + color + "' stroke-width='6'/>" +
            "<text x='50%' y='50%' font-family='sans-serif' font-size='28' fill='" + color + "' dominant-baseline='middle' text-anchor='middle'>" + initial + "</text>" +
            "</svg>";
        String b64 = Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));
        return "data:image/svg+xml;base64," + b64;
    }
}
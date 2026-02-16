package com.japanfeudal.map.api;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.japanfeudal.map.model.Clan;
import com.japanfeudal.map.model.Warrior;
import com.japanfeudal.map.repository.ClanRepository;
import com.japanfeudal.map.repository.WarriorRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@RestController
@RequestMapping("/directory")
public class DirectoryController {
    private final ClanRepository clanRepo;
    private final WarriorRepository warriorRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public DirectoryController(ClanRepository clanRepo, WarriorRepository warriorRepo) {
        this.clanRepo = clanRepo;
        this.warriorRepo = warriorRepo;
    }

    @GetMapping("/clans")
    public ArrayNode clans() {
        ArrayNode out = mapper.createArrayNode();
        for (Clan c : clanRepo.findAll()) {
            ObjectNode n = mapper.createObjectNode();
            n.put("name", c.getName());
            n.put("provinceOrigin", c.getProvinceOrigin());
            n.put("era", c.getEra());
            String crest = c.getCrestUrl();
            if (crest == null || crest.isBlank()) crest = generateCrestDataUri(c.getName());
            n.put("crestUrl", crest);
            ArrayNode wars = mapper.createArrayNode();
            for (Warrior w : c.getWarriors()) {
                ObjectNode wn = mapper.createObjectNode();
                wn.put("name", w.getName());
                wn.put("role", w.getRole());
                wn.put("era", w.getEra());
                wn.put("bio", w.getBio());
                wars.add(wn);
            }
            n.set("warriors", wars);
            out.add(n);
        }
        return out;
    }

    @GetMapping("/warriors")
    public ArrayNode warriors(@RequestParam(required = false) String clan) {
        List<Warrior> list;
        if (clan != null && !clan.isBlank()) list = warriorRepo.findByClan_NameIgnoreCase(clan);
        else list = warriorRepo.findAll();
        ArrayNode out = mapper.createArrayNode();
        for (Warrior w : list) {
            ObjectNode n = mapper.createObjectNode();
            n.put("name", w.getName());
            n.put("role", w.getRole());
            n.put("era", w.getEra());
            n.put("bio", w.getBio());
            n.put("clan", w.getClan() != null ? w.getClan().getName() : "");
            // Crest (clan emblem)
            String crest = w.getClan() != null ? w.getClan().getCrestUrl() : null;
            if (crest == null || crest.isBlank()) crest = generateCrestDataUri(w.getClan() != null ? w.getClan().getName() : w.getName());
            n.put("crestUrl", crest);
            // Warrior image: use warrior-specific image if provided, otherwise fallback to clan crest/data-uri
            String img = w.getImageUrl();
            if (img == null || img.isBlank()) img = crest;
            n.put("imageUrl", img);
            out.add(n);
        }
        return out;
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
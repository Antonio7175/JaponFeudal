package com.japanfeudal.map.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import com.japanfeudal.map.model.Province;
import com.japanfeudal.map.repository.ProvinceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProvinceService {
    private final ProvinceRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public ProvinceService(ProvinceRepository repo) {
        this.repo = repo;
    }

    public JsonNode getFeatureCollectionMulti(List<String> clans, List<String> eras, String nameQuery) {
        List<Province> all = repo.findAll();
        Set<String> clanSet = clans == null ? Set.of() : clans.stream().map(String::toLowerCase).collect(Collectors.toSet());
        Set<String> eraSet  = eras  == null ? Set.of() : eras.stream().map(String::toLowerCase).collect(Collectors.toSet());
        String nameQ = nameQuery == null ? "" : nameQuery.toLowerCase();

        List<Province> filtered = all.stream().filter(p -> {
            boolean okClan = clanSet.isEmpty() || (p.getClan() != null && clanSet.contains(p.getClan().toLowerCase()));
            boolean okEra  = eraSet.isEmpty()  || (p.getEra()  != null && eraSet.contains(p.getEra().toLowerCase()));
            boolean okName = nameQ.isBlank()   || (p.getName() != null && p.getName().toLowerCase().contains(nameQ));
            return okClan && okEra && okName;
        }).toList();

        ObjectNode fc = mapper.createObjectNode();
        fc.put("type", "FeatureCollection");
        ArrayNode features = mapper.createArrayNode();

        for (Province p : filtered) {
            ObjectNode f = mapper.createObjectNode();
            f.put("type", "Feature");
            ObjectNode props = mapper.createObjectNode();
            props.put("name", p.getName());
            props.put("clan", p.getClan());
            props.put("era", p.getEra());
            f.set("properties", props);
            try {
                JsonNode geom = mapper.readTree(p.getGeoJson());
                f.set("geometry", geom);
            } catch (Exception e) {
                f.set("geometry", NullNode.getInstance());
            }
            features.add(f);
        }
        fc.set("features", features);
        return fc;
    }
}
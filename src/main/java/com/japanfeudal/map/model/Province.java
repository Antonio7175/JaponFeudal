package com.japanfeudal.map.model;

import jakarta.persistence.*;

@Entity
@Table(name = "provinces")
public class Province {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String clan;
    private String era;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String geoJson; // GeoJSON de la geometría (Polygon o MultiPolygon)

    public Province() {}

    public Province(String name, String clan, String era, String geoJson) {
        this.name = name;
        this.clan = clan;
        this.era = era;
        this.geoJson = geoJson;
    }

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getClan() { return clan; }
    public void setClan(String clan) { this.clan = clan; }
    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }
    public String getGeoJson() { return geoJson; }
    public void setGeoJson(String geoJson) { this.geoJson = geoJson; }
}
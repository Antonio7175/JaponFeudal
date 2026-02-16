package com.japanfeudal.map.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clans")
public class Clan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String provinceOrigin;
    private String era;
    private String crestUrl;

    // NUEVO: ubicación del clan (punto o polígono) en GeoJSON
    @Lob
    @Column(columnDefinition = "CLOB")
    private String locationGeoJson;

    @OneToMany(mappedBy = "clan")
    private List<Warrior> warriors = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvinceOrigin() { return provinceOrigin; }
    public void setProvinceOrigin(String provinceOrigin) { this.provinceOrigin = provinceOrigin; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getCrestUrl() { return crestUrl; }
    public void setCrestUrl(String crestUrl) { this.crestUrl = crestUrl; }

    public String getLocationGeoJson() { return locationGeoJson; }
    public void setLocationGeoJson(String locationGeoJson) { this.locationGeoJson = locationGeoJson; }

    public List<Warrior> getWarriors() { return warriors; }
    public void setWarriors(List<Warrior> warriors) { this.warriors = warriors; }
}
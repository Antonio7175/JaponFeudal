package com.japanfeudal.map.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "battles")
public class Battle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate date;
    private String era;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String geoJson;

    // NUEVO: imagen representativa (ruta estática)
    private String imageUrl;

    @ManyToMany
    @JoinTable(
        name = "battle_clans",
        joinColumns = @JoinColumn(name = "battle_id"),
        inverseJoinColumns = @JoinColumn(name = "clan_id")
    )
    private Set<Clan> clans = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "battle_warriors",
        joinColumns = @JoinColumn(name = "battle_id"),
        inverseJoinColumns = @JoinColumn(name = "warrior_id")
    )
    private Set<Warrior> warriors = new HashSet<>();

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getGeoJson() { return geoJson; }
    public void setGeoJson(String geoJson) { this.geoJson = geoJson; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Set<Clan> getClans() { return clans; }
    public void setClans(Set<Clan> clans) { this.clans = clans; }

    public Set<Warrior> getWarriors() { return warriors; }
    public void setWarriors(Set<Warrior> warriors) { this.warriors = warriors; }
}
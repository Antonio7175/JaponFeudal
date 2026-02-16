package com.japanfeudal.map.model;

import jakarta.persistence.*;

@Entity
@Table(name = "warriors")
public class Warrior {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String era;
    private String role;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String bio;

    // NUEVO: imagen del guerrero (ruta estática)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "clan_id")
    private Clan clan;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Clan getClan() { return clan; }
    public void setClan(Clan clan) { this.clan = clan; }
}
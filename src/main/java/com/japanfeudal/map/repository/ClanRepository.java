package com.japanfeudal.map.repository;

import com.japanfeudal.map.model.Clan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClanRepository extends JpaRepository<Clan, Long> {
    Optional<Clan> findByNameIgnoreCase(String name);
}
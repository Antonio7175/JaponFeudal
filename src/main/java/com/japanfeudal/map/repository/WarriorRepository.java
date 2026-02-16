package com.japanfeudal.map.repository;

import com.japanfeudal.map.model.Warrior;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WarriorRepository extends JpaRepository<Warrior, Long> {
    List<Warrior> findByClan_NameIgnoreCase(String clanName);
    Optional<Warrior> findByNameIgnoreCase(String name);
}
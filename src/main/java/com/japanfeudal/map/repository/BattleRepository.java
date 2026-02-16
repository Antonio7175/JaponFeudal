package com.japanfeudal.map.repository;

import com.japanfeudal.map.model.Battle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BattleRepository extends JpaRepository<Battle, Long> {
	Optional<Battle> findByNameIgnoreCase(String name);
}
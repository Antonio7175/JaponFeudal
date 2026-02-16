package com.japanfeudal.map.repository;

import com.japanfeudal.map.model.Province;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProvinceRepository extends JpaRepository<Province, Long> {
    List<Province> findByClanIgnoreCase(String clan);
    List<Province> findByEraIgnoreCase(String era);
    List<Province> findByClanIgnoreCaseAndEraIgnoreCase(String clan, String era);
}
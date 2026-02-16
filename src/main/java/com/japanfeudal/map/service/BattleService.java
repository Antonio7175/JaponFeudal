package com.japanfeudal.map.service;

import com.japanfeudal.map.model.Battle;
import com.japanfeudal.map.repository.BattleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BattleService {
    private final BattleRepository repo;

    public BattleService(BattleRepository repo) { this.repo = repo; }

    public List<Battle> filter(String clan, String warrior, Integer fromYear, Integer toYear) {
        return repo.findAll().stream().filter(b -> {
            boolean okClan = clan == null || clan.isBlank()
                    || b.getClans().stream().anyMatch(c -> c.getName() != null && c.getName().equalsIgnoreCase(clan));
            boolean okWar  = warrior == null || warrior.isBlank()
                    || b.getWarriors().stream().anyMatch(w -> w.getName() != null && w.getName().equalsIgnoreCase(warrior));
            boolean okFrom = fromYear == null || b.getDate() == null || b.getDate().getYear() >= fromYear;
            boolean okTo   = toYear == null   || b.getDate() == null || b.getDate().getYear() <= toYear;
            return okClan && okWar && okFrom && okTo;
        }).toList();
    }
}
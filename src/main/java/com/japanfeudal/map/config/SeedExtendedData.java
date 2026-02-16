package com.japanfeudal.map.config;

import com.japanfeudal.map.model.*;
import com.japanfeudal.map.repository.*;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import java.time.LocalDate;

@Component
public class SeedExtendedData implements CommandLineRunner {

    private final ClanRepository clanRepo;
    private final WarriorRepository warriorRepo;
    private final BattleRepository battleRepo;

    public SeedExtendedData(ClanRepository clanRepo, WarriorRepository warriorRepo, BattleRepository battleRepo) {
        this.clanRepo = clanRepo;
        this.warriorRepo = warriorRepo;
        this.battleRepo = battleRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (clanRepo.count() > 0) return;

        Clan takeda = new Clan();
        takeda.setName("Takeda");
        takeda.setProvinceOrigin("Kai");
        takeda.setEra("Sengoku");
        clanRepo.save(takeda);

        Clan uesugi = new Clan();
        uesugi.setName("Uesugi");
        uesugi.setProvinceOrigin("Echigo");
        uesugi.setEra("Sengoku");
        clanRepo.save(uesugi);

        Warrior shingen = new Warrior();
        shingen.setName("Takeda Shingen");
        shingen.setEra("Sengoku");
        shingen.setRole("Daimyo");
        shingen.setBio("Líder del clan Takeda, 'Tigre de Kai'.");
        shingen.setClan(takeda);
        warriorRepo.save(shingen);

        Warrior kenshin = new Warrior();
        kenshin.setName("Uesugi Kenshin");
        kenshin.setEra("Sengoku");
        kenshin.setRole("Daimyo");
        kenshin.setBio("Rival de Shingen, 'Dragón de Echigo'.");
        kenshin.setClan(uesugi);
        warriorRepo.save(kenshin);

        Battle kawanakajima = new Battle();
        kawanakajima.setName("Batallas de Kawanakajima");
        kawanakajima.setEra("Sengoku");
        kawanakajima.setDate(LocalDate.of(1561, 9, 10)); // año clave de las batallas
        kawanakajima.setGeoJson("{\"type\":\"Point\",\"coordinates\":[138.4,36.6]}");
        kawanakajima.getClans().add(takeda);
        kawanakajima.getClans().add(uesugi);
        kawanakajima.getWarriors().add(shingen);
        kawanakajima.getWarriors().add(kenshin);
        battleRepo.save(kawanakajima);
    }
}
package com.japanfeudal.map.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MenuController {

    @GetMapping("/")
    public String home() {
        return "redirect:/map";
    }

    @GetMapping("/map")
    public String map() {
        return "map";
    }

    @GetMapping("/clans")
    public String clans() { return "clans"; }

    @GetMapping("/warriors")
    public String warriors() { return "warriors"; }

    @GetMapping("/battles")
    public String battles() { return "battles"; }

    @GetMapping("/game")
    public String game() { return "glossary_game"; }
}
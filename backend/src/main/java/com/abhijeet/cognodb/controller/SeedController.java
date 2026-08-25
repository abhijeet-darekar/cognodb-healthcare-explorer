package com.abhijeet.cognodb.controller;

import com.abhijeet.cognodb.seed.SeedDataLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SeedController {

    @Autowired
    private SeedDataLoader seedDataLoader;

    @PostMapping("/api/seed")
    public String seed() {
        return seedDataLoader.seed();
    }
}
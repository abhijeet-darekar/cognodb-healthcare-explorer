package com.abhijeet.cognodb.controller;

import org.neo4j.driver.Driver;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final Driver driver;

    public HealthController(Driver driver) {
        this.driver = driver;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();

        try (var session = driver.session()) {
            session.run("RETURN 1").single();

            response.put("status", "UP");
            response.put("service", "healthcare-backend");
            response.put("database", "CONNECTED");
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("service", "healthcare-backend");
            response.put("database", "DISCONNECTED");
        }

        return response;
    }
}

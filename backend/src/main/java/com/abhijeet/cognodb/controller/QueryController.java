package com.abhijeet.cognodb.controller;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class QueryController {

    @Autowired
    private Driver driver;

    // 1. Multi-hop traversal: find every doctor reachable through referral chains
    // starting from a given doctor, and which hospitals they work at.
    @GetMapping("/api/referral-chain")
    public List<Map<String, Object>> referralChain(@RequestParam String doctorName) {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (start:Doctor {name: $name})-[:REFERRED_TO*1..4]->(reached:Doctor)
                MATCH (reached)-[:WORKS_AT]->(h:Hospital)
                RETURN DISTINCT reached.name AS doctor, reached.specialty AS specialty, h.name AS hospital
                """,
                    Map.of("name", doctorName));

            List<Map<String, Object>> output = new ArrayList<>();
            for (Record record : result.list()) {
                Map<String, Object> row = new HashMap<>();
                row.put("doctor", record.get("doctor").asString());
                row.put("specialty", record.get("specialty").asString());
                row.put("hospital", record.get("hospital").asString());
                output.add(row);
            }
            return output;
        }
    }

    // 2. "SQL-awkward" query: for each condition, list every hospital that has
    // treated it, along with how many patients — a relational DB would need
    // several JOINs across patients, treatments, conditions, doctors, hospitals.
    @GetMapping("/api/condition-hospital-network")
    public List<Map<String, Object>> conditionHospitalNetwork() {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (p:Patient)-[:DIAGNOSED_WITH]->(c:Condition)
                MATCH (p)-[:TREATED_BY]->(d:Doctor)-[:WORKS_AT]->(h:Hospital)
                RETURN c.name AS condition, h.name AS hospital, count(DISTINCT p) AS patientCount
                ORDER BY condition
                """);

            List<Map<String, Object>> output = new ArrayList<>();
            for (Record record : result.list()) {
                Map<String, Object> row = new HashMap<>();
                row.put("condition", record.get("condition").asString());
                row.put("hospital", record.get("hospital").asString());
                row.put("patientCount", record.get("patientCount").asInt());
                output.add(row);
            }
            return output;
        }
    }
}
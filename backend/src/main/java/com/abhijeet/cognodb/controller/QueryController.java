package com.abhijeet.cognodb.controller;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://cognodb-healthcare-explorer-1.onrender.com"
})
@RestController
public class QueryController {

    @Autowired
    private Driver driver;

    // ============================================================
    // 1. MULTI-HOP REFERRAL CHAIN
    // Doctor -> referred doctor -> hospital
    // ============================================================
    @GetMapping("/api/referral-chain")
    public List<Map<String, Object>> referralChain(
            @RequestParam String doctorName) {

        try (Session session = driver.session()) {

            var result = session.run("""
                MATCH (start:Doctor {name: $name})
                      -[:REFERRED_TO*1..4]->
                      (reached:Doctor)
                MATCH (reached)-[:WORKS_AT]->(h:Hospital)

                RETURN DISTINCT
                    reached.name AS doctor,
                    reached.specialty AS specialty,
                    h.name AS hospital
                """,
                    Map.of("name", doctorName));

            List<Map<String, Object>> output = new ArrayList<>();

            for (Record record : result.list()) {

                Map<String, Object> row = new HashMap<>();

                row.put("doctor",
                        record.get("doctor").asString());

                row.put("specialty",
                        record.get("specialty").asString());

                row.put("hospital",
                        record.get("hospital").asString());

                output.add(row);
            }

            return output;
        }
    }

    // ============================================================
    // 2. CONDITION -> HOSPITAL NETWORK
    //
    // Patient -> Condition
    // Patient -> Doctor -> Hospital
    //
    // This demonstrates a query that is more natural in a graph
    // than in a traditional relational schema.
    // ============================================================
    @GetMapping("/api/condition-hospital-network")
    public List<Map<String, Object>> conditionHospitalNetwork() {

        try (Session session = driver.session()) {

            var result = session.run("""
                MATCH (p:Patient)-[:DIAGNOSED_WITH]->(c:Condition)
                MATCH (p)-[:TREATED_BY]->(d:Doctor)-[:WORKS_AT]->(h:Hospital)

                RETURN
                    c.name AS condition,
                    h.name AS hospital,
                    count(DISTINCT p) AS patientCount

                ORDER BY condition
                """);

            List<Map<String, Object>> output = new ArrayList<>();

            for (Record record : result.list()) {

                Map<String, Object> row = new HashMap<>();

                row.put("condition",
                        record.get("condition").asString());

                row.put("hospital",
                        record.get("hospital").asString());

                row.put("patientCount",
                        record.get("patientCount").asInt());

                output.add(row);
            }

            return output;
        }
    }

    // ============================================================
    // 3. CONDITION -> PATIENTS
    // ============================================================
    @GetMapping("/api/condition-patients")
    public List<Map<String, Object>> conditionPatients(
            @RequestParam String condition) {

        try (Session session = driver.session()) {

            var result = session.run("""
                MATCH (p:Patient)
                      -[:DIAGNOSED_WITH]->
                      (c:Condition {name: $condition})

                RETURN
                    p.name AS name,
                    p.age AS age,
                    p.gender AS gender

                ORDER BY p.name
                """,
                    Map.of("condition", condition));

            List<Map<String, Object>> output = new ArrayList<>();

            for (Record record : result.list()) {

                Map<String, Object> row = new HashMap<>();

                row.put("name",
                        record.get("name").asString());

                row.put("age",
                        record.get("age").asInt());

                row.put("gender",
                        record.get("gender").asString());

                output.add(row);
            }

            return output;
        }
    }

    // ============================================================
    // 4. COMPLETE PATIENT RELATIONSHIP
    //
    // Patient
    //    |
    //    | DIAGNOSED_WITH
    //    v
    // Condition
    //    ^
    //    | FOR_CONDITION
    //    |
    // Treatment
    //
    // Patient -> TREATED_BY -> Doctor -> WORKS_AT -> Hospital
    //
    // The frontend will use this endpoint to make the
    // Relationship Path interactive.
    // ============================================================
    @GetMapping("/api/patient-relationship")
    public Map<String, Object> patientRelationship(
            @RequestParam String patientName) {

        try (Session session = driver.session()) {

            var result = session.run("""
                MATCH (p:Patient {name: $patientName})

                OPTIONAL MATCH (p)-[:DIAGNOSED_WITH]->(c:Condition)

                OPTIONAL MATCH (p)-[:RECEIVED]->(t:Treatment)
                OPTIONAL MATCH (t)-[:FOR_CONDITION]->(tc:Condition)

                OPTIONAL MATCH (p)-[:TREATED_BY]->(d:Doctor)
                OPTIONAL MATCH (d)-[:WORKS_AT]->(h:Hospital)

                RETURN
                    p.name AS patientName,
                    p.age AS patientAge,
                    p.gender AS patientGender,

                    c.name AS conditionName,
                    c.category AS conditionCategory,

                    t.name AS treatmentName,
                    t.date AS treatmentDate,

                    d.name AS doctorName,
                    d.specialty AS doctorSpecialty,

                    h.name AS hospitalName,
                    h.city AS hospitalCity
                """,
                    Map.of("patientName", patientName));

            List<Record> records = result.list();

            if (records.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("found", false);
                response.put("message",
                        "Patient not found: " + patientName);
                return response;
            }

            Record record = records.get(0);

            Map<String, Object> response = new HashMap<>();

            response.put("found", true);

            // ----------------------------------------------------
            // Patient
            // ----------------------------------------------------
            Map<String, Object> patient = new HashMap<>();

            patient.put(
                    "name",
                    record.get("patientName").asString()
            );

            patient.put(
                    "age",
                    record.get("patientAge").asInt()
            );

            patient.put(
                    "gender",
                    record.get("patientGender").asString()
            );

            response.put("patient", patient);

            // ----------------------------------------------------
            // Condition
            // ----------------------------------------------------
            Map<String, Object> condition = new HashMap<>();

            if (!record.get("conditionName").isNull()) {

                condition.put(
                        "name",
                        record.get("conditionName").asString()
                );

                if (!record.get("conditionCategory").isNull()) {
                    condition.put(
                            "category",
                            record.get("conditionCategory").asString()
                    );
                }

            } else {

                condition.put("name", null);
                condition.put("category", null);
            }

            response.put("condition", condition);

            // ----------------------------------------------------
            // Treatment
            // ----------------------------------------------------
            Map<String, Object> treatment = new HashMap<>();

            if (!record.get("treatmentName").isNull()) {

                treatment.put(
                        "name",
                        record.get("treatmentName").asString()
                );

                if (!record.get("treatmentDate").isNull()) {
                    treatment.put(
                            "date",
                            record.get("treatmentDate").asString()
                    );
                }

            } else {

                treatment.put("name", null);
                treatment.put("date", null);
            }

            response.put("treatment", treatment);

            // ----------------------------------------------------
            // Doctor / Provider
            // ----------------------------------------------------
            Map<String, Object> provider = new HashMap<>();

            if (!record.get("doctorName").isNull()) {

                provider.put(
                        "name",
                        record.get("doctorName").asString()
                );

                if (!record.get("doctorSpecialty").isNull()) {
                    provider.put(
                            "specialty",
                            record.get("doctorSpecialty").asString()
                    );
                }

            } else {

                provider.put("name", null);
                provider.put("specialty", null);
            }

            response.put("provider", provider);

            // ----------------------------------------------------
            // Hospital
            // ----------------------------------------------------
            Map<String, Object> hospital = new HashMap<>();

            if (!record.get("hospitalName").isNull()) {

                hospital.put(
                        "name",
                        record.get("hospitalName").asString()
                );

                if (!record.get("hospitalCity").isNull()) {
                    hospital.put(
                            "city",
                            record.get("hospitalCity").asString()
                    );
                }

            } else {

                hospital.put("name", null);
                hospital.put("city", null);
            }

            response.put("hospital", hospital);

            return response;
        }
    }
}

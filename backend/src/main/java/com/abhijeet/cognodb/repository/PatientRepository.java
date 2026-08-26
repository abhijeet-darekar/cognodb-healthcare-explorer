package com.abhijeet.cognodb.repository;

import org.neo4j.driver.Driver;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class PatientRepository {

    private final Driver driver;

    public PatientRepository(Driver driver) {
        this.driver = driver;
    }

    public List<Map<String, Object>> findAllPatients() {
        try (var session = driver.session()) {
            return session.run("""
                    MATCH (p:Patient)
                    RETURN p
                    ORDER BY p.name
                    """)
                    .list(record -> record.get("p").asMap());
        }
    }
}
package com.abhijeet.cognodb.seed;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.HashMap;

@Component
public class SeedDataLoader {

    @Autowired
    private Driver driver;

    public String seed() {
        try (Session session = driver.session()) {

            // Clear existing data first (safe for re-running during dev)
            session.run("MATCH (n) DETACH DELETE n");

            // ============================================================
            // Hospitals
            // ============================================================
            session.run("""
                CREATE (h1:Hospital {name: $h1, city: $c1})
                CREATE (h2:Hospital {name: $h2, city: $c2})
                """,
                    Map.<String, Object>of(
                            "h1", "City General Hospital",
                            "c1", "Pune",
                            "h2", "Sunrise Multispecialty",
                            "c2", "Mumbai"
                    ));

            // ============================================================
            // Doctors
            // ============================================================
            session.run("""
                MATCH (h1:Hospital {name: $h1}), (h2:Hospital {name: $h2})

                CREATE (d1:Doctor {name: $d1, specialty: $s1})-[:WORKS_AT]->(h1)
                CREATE (d2:Doctor {name: $d2, specialty: $s2})-[:WORKS_AT]->(h1)
                CREATE (d3:Doctor {name: $d3, specialty: $s3})-[:WORKS_AT]->(h2)

                CREATE (d1)-[:REFERRED_TO {date: $ref1}]->(d3)
                CREATE (d2)-[:REFERRED_TO {date: $ref2}]->(d1)
                """,
                    Map.<String, Object>of(
                            "h1", "City General Hospital",
                            "h2", "Sunrise Multispecialty",

                            "d1", "Dr. Mehta",
                            "s1", "General Physician",

                            "d2", "Dr. Rao",
                            "s2", "Cardiologist",

                            "d3", "Dr. Kulkarni",
                            "s3", "Oncologist",

                            "ref1", "2026-01-15",
                            "ref2", "2026-02-10"
                    ));

            // ============================================================
            // Conditions
            // ============================================================
            session.run("""
                CREATE (c1:Condition {
                    name: $c1,
                    category: $cat1
                })

                CREATE (c2:Condition {
                    name: $c2,
                    category: $cat2
                })
                """,
                    Map.<String, Object>of(
                            "c1", "Hypertension",
                            "cat1", "Cardiovascular",

                            "c2", "Type 2 Diabetes",
                            "cat2", "Metabolic"
                    ));

            // ============================================================
            // Patients + Relationships + Treatments
            // ============================================================
            session.run("""
                MATCH (d1:Doctor {name: $d1}),
                      (d2:Doctor {name: $d2}),
                      (d3:Doctor {name: $d3})

                MATCH (c1:Condition {name: $c1}),
                      (c2:Condition {name: $c2})

                // Patients
                CREATE (p1:Patient {
                    name: $p1,
                    age: $age1,
                    gender: $g1
                })

                CREATE (p2:Patient {
                    name: $p2,
                    age: $age2,
                    gender: $g2
                })

                // Patient → Doctor
                CREATE (p1)-[:TREATED_BY]->(d2)
                CREATE (p2)-[:TREATED_BY]->(d1)

                // Patient → Condition
                CREATE (p1)-[:DIAGNOSED_WITH]->(c1)
                CREATE (p2)-[:DIAGNOSED_WITH]->(c2)

                // Treatments
                CREATE (t1:Treatment {
                    name: $t1,
                    date: $tdate1
                })

                CREATE (t2:Treatment {
                    name: $t2,
                    date: $tdate2
                })

                // Treatment → Condition
                CREATE (t1)-[:FOR_CONDITION]->(c1)
                CREATE (t2)-[:FOR_CONDITION]->(c2)

                // Patient → Treatment
                CREATE (p1)-[:RECEIVED]->(t1)
                CREATE (p2)-[:RECEIVED]->(t2)
                """,
                    new HashMap<String, Object>() {{

                        // Doctors
                        put("d1", "Dr. Mehta");
                        put("d2", "Dr. Rao");
                        put("d3", "Dr. Kulkarni");

                        // Conditions
                        put("c1", "Hypertension");
                        put("c2", "Type 2 Diabetes");

                        // Patient 1
                        put("p1", "Anil Sharma");
                        put("age1", 54);
                        put("g1", "Male");

                        // Patient 2
                        put("p2", "Sunita Verma");
                        put("age2", 47);
                        put("g2", "Female");

                        // Treatment 1
                        put("t1", "Beta Blocker Therapy");
                        put("tdate1", "2026-03-01");

                        // Treatment 2
                        put("t2", "Metformin Therapy");
                        put("tdate2", "2026-03-10");
                    }});

            return "Seed data created successfully";
        }
    }
}

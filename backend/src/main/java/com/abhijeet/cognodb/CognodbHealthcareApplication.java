package com.abhijeet.cognodb;

import org.neo4j.driver.Driver;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CognodbHealthcareApplication {

    public static void main(String[] args) {
        SpringApplication.run(CognodbHealthcareApplication.class, args);
    }

    @Bean
    CommandLineRunner testCognoDbConnection(Driver driver) {
        return args -> {
            try (var session = driver.session()) {
                var result = session.run("RETURN 1 AS connected");
                System.out.println(
                    "CognoDB connection successful: "
                    + result.single().get("connected").asInt()
                );
            }
        };
    }
}

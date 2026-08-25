package com.abhijeet.cognodb.controller;

import com.abhijeet.cognodb.service.PatientService;
import org.neo4j.driver.Record;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<Record> getAllPatients() {
        return patientService.findAllPatients();
    }
}

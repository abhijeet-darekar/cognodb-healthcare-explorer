package com.abhijeet.cognodb.service;

import com.abhijeet.cognodb.repository.PatientRepository;
import org.neo4j.driver.Record;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Record> findAllPatients() {
        return patientRepository.findAllPatients();
    }
}

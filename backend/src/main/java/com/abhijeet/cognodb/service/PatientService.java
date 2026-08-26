package com.abhijeet.cognodb.service;

import com.abhijeet.cognodb.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Map<String, Object>> findAllPatients() {
        return patientRepository.findAllPatients();
    }
}
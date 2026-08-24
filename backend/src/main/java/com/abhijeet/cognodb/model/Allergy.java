package com.abhijeet.cognodb.model;

public class Allergy {

    private String id;
    private String name;
    private String severity;

    public Allergy() {
    }

    public Allergy(String id, String name, String severity) {
        this.id = id;
        this.name = name;
        this.severity = severity;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}

# Healthcare Relationship Explorer

## Live Demo

### Frontend

https://cognodb-healthcare-explorer-1.onrender.com

### Backend

https://cognodb-healthcare-backend.onrender.com

### GitHub Repository

https://github.com/abhijeet-darekar/cognodb-healthcare-explorer

The deployed application provides an interactive healthcare graph explorer
connected to a live backend and CognoDB database.

### Available Features

- Select a patient and explore their healthcare relationships.
- View Patient → Condition → Treatment → Provider → Hospital relationships.
- Search doctor referral chains.
- Explore the Condition → Hospital network.
- View patient counts associated with conditions and hospitals.


A graph-based healthcare explorer built with Spring Boot, React, and CognoDB. The application allows users to explore doctor referral chains and condition-to-hospital relationships.

## Documentation

- [Backend API](./backend/API.md)
- [Backend Setup](./backend/SETUP.md)
- [Frontend Setup](./frontend/SETUP.md)
- [Development Guide](./DEVELOPMENT.md)


## Why a Graph Database?

Healthcare data contains many connected entities such as doctors, hospitals, patients, conditions, and treatments. These connections are important for understanding referral pathways and healthcare networks.

A graph database is a good fit because relationships are first-class data. For example, the application can follow a multi-hop referral chain such as:

Doctor → REFERRED_TO → Doctor → REFERRED_TO → Doctor

This makes relationship-based questions easier to express than repeatedly joining multiple relational tables.

The application also uses graph traversal to find hospitals associated with patients and their diagnosed conditions.



## Data Model

```text
                         ┌─────────────────────┐
                         │       Hospital      │
                         │    name, city       │
                         └──────────▲──────────┘
                                    │
                                  WORKS_AT
                                    │
                         ┌──────────┴──────────┐
                         │       Doctor        │
                         │ name, specialty     │
                         └──────────┬──────────┘
                                    │
                               REFERRED_TO
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Doctor        │
                         │ name, specialty     │
                         └─────────────────────┘


┌─────────────────────┐
│       Patient       │
│ name, age, gender   │
└──────────┬──────────┘
           │
     ┌─────┴───────────────┐
     │                     │
 TREATED_BY          DIAGNOSED_WITH
     │                     │
     ▼                     ▼
┌───────────────┐    ┌──────────────────┐
│    Doctor     │    │    Condition     │
│name, specialty│    │ name, category   │
└───────────────┘    └──────────────────┘

```

## Setup and Run

### 1. Create a CognoDB Instance

Create a free CognoDB instance and obtain the Bolt connection URI and password.

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```text
COGNODB_URI=your_cognodb_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_password
```


## Main Cypher Queries

### 1. Multi-Hop Doctor Referral Traversal

This query follows referral relationships from a starting doctor for up to four hops.

```cypher
MATCH (start:Doctor {name: $name})-[:REFERRED_TO*1..4]->(reached:Doctor)
MATCH (reached)-[:WORKS_AT]->(h:Hospital)
RETURN DISTINCT
       reached.name AS doctor,
       reached.specialty AS specialty,
       h.name AS hospital
```

The `$name` parameter is supplied by the Spring Boot backend through the database driver.

The seeded data contains this two-hop referral chain:

```text
Dr. Rao
   │
   │ REFERRED_TO
   ▼
Dr. Mehta
   │
   │ REFERRED_TO
   ▼
Dr. Kulkarni
```

### 2. Condition → Hospital Network

This query finds hospitals associated with patients diagnosed with each condition and counts the patients.

```cypher
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(c:Condition)
MATCH (p)-[:TREATED_BY]->(d:Doctor)-[:WORKS_AT]->(h:Hospital)
RETURN
       c.name AS condition,
       h.name AS hospital,
       count(DISTINCT p) AS patientCount
ORDER BY condition
```

This query traverses:

Patient → Condition

and:

Patient → Doctor → Hospital

A relational database would require several joins to represent these relationships.



## UI Screenshots

### Condition → Hospital Network

![Condition Hospital Network](ui-condition-network2.png)

### Doctor Referral Chain

![Doctor Referral Chain](ui-referral-chain1.png)






## API Quick Reference

### Backend Health

```text
GET http://localhost:8080/api/health
```

### Seed Healthcare Data

```text
POST http://localhost:8080/api/seed
```

### Doctor Referral Chain

```text
GET http://localhost:8080/api/referral-chain?doctorName=Dr.%20Mehta
```

### Condition-Hospital Network

```text
GET http://localhost:8080/api/condition-hospital-network
```

For detailed API information, see [`backend/API.md`](./backend/API.md).

For backend setup instructions, see [`backend/SETUP.md`](./backend/SETUP.md).

For frontend setup instructions, see [`frontend/SETUP.md`](./frontend/SETUP.md).

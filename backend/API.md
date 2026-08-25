# Healthcare Backend API

The Spring Boot backend runs on:

`http://localhost:8080`

## Health Check

### GET `/api/health`

Checks whether the backend is running.

Example:

```text
GET http://localhost:8080/api/health

```

Response:

```json
{
  "service": "healthcare-backend",
  "status": "UP"
}
```

## Seed Data

### POST `/api/seed`

Creates the healthcare graph seed data.

Example using PowerShell:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8080/api/seed" -Method POST
```

Expected response:

```text
Seed data created successfully
```

## Doctor Referral Chain

### GET `/api/referral-chain`

Returns doctors reachable through referral relationships.

Example:

```text
GET /api/referral-chain?doctorName=Dr.%20Mehta
```

Example response:

```json
[
  {
    "doctor": "Dr. Mehta",
    "specialty": "General Physician",
    "hospital": "City General Hospital"
  },
  {
    "doctor": "Dr. Kulkarni",
    "specialty": "Oncologist",
    "hospital": "Sunrise Multispecialty"
  }
]
```

## Condition-Hospital Network

### GET `/api/condition-hospital-network`

Returns conditions, hospitals, and the number of patients associated with each relationship.

Example:

```text
GET /api/condition-hospital-network
```

Response fields:

- `condition`
- `hospital`
- `patientCount`

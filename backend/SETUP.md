# Backend Setup Guide

## Requirements

Before starting the backend, make sure the following are installed:

- Java
- Maven
- CognoDB / Neo4j database

## Environment Variables

Create a local `.env` file inside the `backend` directory.

The project expects:

```text
COGNODB_URI=your_database_uri
COGNODB_USERNAME=your_username
COGNODB_PASSWORD=your_password
```

Never commit the real `.env` file.

Use `backend/.env.example` as the template.

## Start the Backend

From the project root:

```powershell
cd backend
```

Start the Spring Boot application using the IDE or Maven.

The backend runs on:

```text
http://localhost:8080
```

## Verify the Backend

Check the health endpoint:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8080/api/health"
```

A successful response contains:

```json
{
  "service": "healthcare-backend",
  "status": "UP"
}
```

## Seed the Database

After the backend is running:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8080/api/seed" -Method POST
```

Expected response:

```text
Seed data created successfully
```

## Verify CognoDB Connection

When Spring Boot starts successfully, the console should show:

```text
CognoDB connection successful: 1
```

# Development Guide

## Project Architecture

The project has two main applications:

```text
cognodb-healthcare-explorer/
├── backend/     Spring Boot REST API
├── frontend/    React + Vite application
└── docs/        Project documentation
```

## Backend

The backend is responsible for:

- Connecting to CognoDB
- Seeding healthcare graph data
- Running Cypher queries
- Providing REST APIs

The backend runs on:

```text
http://localhost:8080
```

## Frontend

The frontend is responsible for:

- Doctor referral chain search
- Condition-hospital network display
- Communicating with the backend APIs
- Displaying healthcare graph results

The frontend runs through Vite.

## Development Workflow

1. Start the CognoDB database.
2. Start the Spring Boot backend.
3. Verify `/api/health`.
4. Seed the healthcare data using `/api/seed`.
5. Start the React frontend.
6. Test the referral chain.
7. Test the condition-hospital network.

## API Flow

```text
React Frontend
      │
      │ HTTP requests
      ▼
Spring Boot REST API
      │
      │ Cypher queries
      ▼
CognoDB / Neo4j
```

## Security

Never commit real database credentials.

The following files are intended to remain local:

```text
backend/.env
frontend/.env
```

Use the corresponding `.env.example` files as templates.

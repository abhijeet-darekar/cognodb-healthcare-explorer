# Project Structure

```text
cognodb-healthcare-explorer/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/abhijeet/cognodb/
│   │       │       ├── controller/
│   │       │       ├── repository/
│   │       │       ├── seed/
│   │       │       └── service/
│   │       └── resources/
│   ├── API.md
│   ├── SETUP.md
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── SETUP.md
│   ├── package.json
│   └── .env.example
│
├── docs/
│
├── README.md
├── DEVELOPMENT.md
├── CHANGELOG.md
├── LICENSE
├── VERSION
└── .gitignore
```

## Backend Responsibilities

The backend:

- Connects to CognoDB.
- Seeds healthcare graph data.
- Executes Cypher queries.
- Provides REST endpoints.
- Checks database connectivity.

## Frontend Responsibilities

The frontend:

- Provides the healthcare explorer UI.
- Searches doctor referral chains.
- Displays condition-hospital relationships.
- Communicates with the backend REST API.

## Documentation

Important documentation files include:

- `README.md` — project overview.
- `backend/API.md` — API reference.
- `backend/SETUP.md` — backend setup.
- `frontend/SETUP.md` — frontend setup.
- `DEVELOPMENT.md` — development workflow.
- `CHANGELOG.md` — project changes.

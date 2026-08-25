# Frontend Setup Guide

## Requirements

Make sure Node.js and npm are installed.

## Install Dependencies

From the project root:

```powershell
cd frontend
npm install
```

## Start the Frontend

Run:

```powershell
npm run dev
```

Vite will start the development server.

Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Backend Requirement

The Spring Boot backend must also be running:

```text
http://localhost:8080
```

The frontend communicates with the backend through the healthcare REST APIs.

## Available Features

### Doctor Referral Chain

Enter a doctor name and select **Search** to retrieve the referral chain.

Example:

```text
Dr. Mehta
```

### Condition → Hospital Network

Select **Load Data** to retrieve the condition-hospital network and patient counts.

## Troubleshooting

If the frontend displays:

```text
Unable to connect to the healthcare backend.
```

make sure the Spring Boot application is running on port `8080`.

If the frontend dependencies are missing, run:

```powershell
npm install
```

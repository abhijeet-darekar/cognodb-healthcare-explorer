# Contributing

Thank you for your interest in the Healthcare Relationship Explorer.

## Development Setup

Before making changes:

1. Follow the instructions in `backend/SETUP.md`.
2. Follow the instructions in `frontend/SETUP.md`.
3. Make sure the backend can connect to CognoDB.
4. Verify the frontend and backend work correctly.

## Making Changes

When making changes:

- Keep backend and frontend responsibilities separate.
- Follow the existing project structure.
- Do not commit passwords, API keys, or `.env` files.
- Update documentation when behavior changes.
- Test API changes before committing.

## Commit Messages

Use clear commit messages that describe the change.

Examples:

```text
Add backend health endpoint
Improve frontend documentation
Fix referral chain query
Update project setup guide
```

## Pull Requests

Before submitting a pull request:

- Make sure the application builds successfully.
- Test the affected functionality.
- Check `git status`.
- Make sure no secrets are included.
- Update relevant documentation.

## Security

Never commit real database credentials.

Use `.env.example` files as templates for local configuration.

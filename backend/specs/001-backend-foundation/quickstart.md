# Quickstart: Backend Foundation & Authentication

**Feature**: 001-backend-foundation
**Date**: 2026-01-18

## Prerequisites

- Python 3.11+
- PostgreSQL 14+ (local or Railway)
- GitHub OAuth App credentials

## 1. GitHub OAuth App Setup

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: SurveyFlow (Dev)
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8000/api/v1/auth/github/callback`
4. Save the **Client ID** and generate a **Client Secret**

## 2. Environment Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 3. Configuration

Create `.env` file:

```bash
# Database (local PostgreSQL or Railway)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/surveyflow

# GitHub OAuth (from step 1)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/v1/auth/github/callback

# JWT
JWT_SECRET=your-dev-secret-change-in-production
JWT_EXPIRY_HOURS=24
JWT_COOKIE_NAME=surveyflow_token

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
```

## 4. Database Setup

```bash
# Create database (if local PostgreSQL)
createdb surveyflow

# Run migrations
alembic upgrade head
```

## 5. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

## 6. Verify Installation

### Health Check

```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status": "healthy"}
```

### API Documentation

Open in browser:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### OAuth Flow Test

1. Open browser: http://localhost:8000/api/v1/auth/github
2. Authorize with GitHub
3. You'll be redirected to frontend (may show error if frontend not running)
4. Check cookies - `surveyflow_token` should be set

## 7. Run Tests

```bash
# Set test database URL
export TEST_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/surveyflow_test

# Create test database
createdb surveyflow_test

# Run tests
pytest -v
```

## Common Issues

### "OAuth callback state mismatch"

- Clear cookies and try again
- Ensure `GITHUB_CALLBACK_URL` matches OAuth app settings exactly

### "CORS error on frontend"

- Verify `FRONTEND_URL` matches the origin making requests
- Must include protocol (http/https) and port

### "Database connection refused"

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` format: `postgresql+asyncpg://user:pass@host:port/dbname`

### "JWT decode error"

- Clear the `surveyflow_token` cookie
- Log in again to get a fresh token

## Project Structure Reference

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Environment configuration
│   ├── database.py      # SQLAlchemy async setup
│   ├── models/user.py   # User SQLAlchemy model
│   ├── schemas/user.py  # Pydantic schemas
│   ├── routers/
│   │   ├── auth.py      # OAuth & session endpoints
│   │   └── health.py    # Health check
│   ├── services/
│   │   └── github.py    # GitHub OAuth client
│   └── utils/
│       └── security.py  # JWT helpers
├── alembic/             # Database migrations
├── tests/               # pytest tests
├── requirements.txt
└── .env                 # Local configuration (not committed)
```

## Next Steps

After completing Stage 1:
1. Run all tests: `pytest`
2. Verify code quality: `black app/ tests/ && ruff check app/ tests/ && mypy app/`
3. Proceed to Stage 2: Survey Public API

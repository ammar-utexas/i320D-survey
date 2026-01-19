# SurveyFlow Backend

FastAPI backend for the SurveyFlow survey platform with GitHub OAuth authentication.

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with async SQLAlchemy 2.0
- **Migrations**: Alembic
- **Auth**: GitHub OAuth via Authlib, JWT sessions

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- GitHub OAuth App credentials

## Setup

### 1. GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: SurveyFlow (Dev)
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8000/api/v1/auth/github/callback`
4. Save the **Client ID** and generate a **Client Secret**

### 2. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/surveyflow
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/v1/auth/github/callback
JWT_SECRET=your-dev-secret-change-in-production
JWT_EXPIRY_HOURS=24
JWT_COOKIE_NAME=surveyflow_token
FRONTEND_URL=http://localhost:5173
```

### 4. Database Setup

```bash
# Create database
createdb surveyflow

# Run migrations
alembic upgrade head
```

## Running the Server

```bash
uvicorn app.main:app --reload --port 8000
```

## Verify Installation

```bash
# Health check
curl http://localhost:8000/api/v1/health
# Expected: {"status": "healthy"}
```

**API Docs**: http://localhost:8000/docs

## Running Tests

```bash
# Create test database
createdb surveyflow_test

# Run tests
pytest -v
```

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Environment configuration
│   ├── database.py      # SQLAlchemy async setup
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic request/response models
│   ├── routers/         # API route handlers
│   ├── services/        # Business logic
│   └── utils/           # Helpers (JWT, etc.)
├── alembic/             # Database migrations
├── tests/               # pytest tests
├── Dockerfile           # Container build
├── railway.toml         # Railway deployment config
└── requirements.txt
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Health check | No |
| GET | `/api/v1/auth/github` | Start OAuth flow | No |
| GET | `/api/v1/auth/github/callback` | OAuth callback | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| POST | `/api/v1/auth/logout` | End session | Yes |

## Deployment

The backend is configured for Railway deployment:

```bash
# Build and deploy via Dockerfile
railway up
```

See `Dockerfile` and `railway.toml` for configuration.

## Common Issues

**OAuth callback state mismatch**: Clear cookies and ensure `GITHUB_CALLBACK_URL` matches OAuth app settings exactly.

**CORS error**: Verify `FRONTEND_URL` matches the origin making requests (include protocol and port).

**Database connection refused**: Ensure PostgreSQL is running and `DATABASE_URL` uses `postgresql+asyncpg://` prefix.

# SurveyFlow - Project Constitution

## Overview

SurveyFlow is a self-hosted survey platform for educators and researchers. It renders JSON-defined surveys, authenticates users via GitHub OAuth, and exports responses for algorithmic processing (e.g., student pairing).

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   Database      │
│   React/Vite    │────▶│   FastAPI       │────▶│   PostgreSQL    │
│   (Vercel)      │     │   (Railway)     │     │   (Railway)     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  GitHub OAuth   │
                        └─────────────────┘
```

## Project Structure

```
surveyflow/
├── CLAUDE.md              # This file - shared conventions
├── backend/               # FastAPI application
│   ├── CLAUDE.md          # Backend-specific conventions
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/              # React/Vite application
│   ├── CLAUDE.md          # Frontend-specific conventions
│   ├── src/
│   └── package.json
└── surveys/               # Example survey JSON configs
```

## API Contract

Base URL: `/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/github` | Initiate OAuth flow (redirects to GitHub) | No |
| GET | `/auth/github/callback` | Handle OAuth callback, issue JWT | No |
| POST | `/auth/logout` | Invalidate session | Yes |
| GET | `/auth/me` | Get current user info | Yes |

### Survey Endpoints (Admin)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/surveys` | Create survey from JSON config | Yes (Admin) |
| GET | `/surveys` | List surveys for current admin | Yes (Admin) |
| GET | `/surveys/{survey_id}` | Get survey details | Yes (Admin) |
| PATCH | `/surveys/{survey_id}` | Update survey metadata | Yes (Admin) |
| DELETE | `/surveys/{survey_id}` | Soft-delete survey | Yes (Admin) |
| POST | `/surveys/{survey_id}/duplicate` | Duplicate survey | Yes (Admin) |
| GET | `/surveys/{survey_id}/responses` | List all responses | Yes (Admin) |
| GET | `/surveys/{survey_id}/export?format=csv|json` | Export responses | Yes (Admin) |

### Response Endpoints (Respondent)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/surveys/{slug}/public` | Get survey for rendering | No |
| POST | `/surveys/{slug}/respond` | Submit/update response (upsert) | Yes |
| GET | `/surveys/{slug}/my-response` | Get user's saved response | Yes |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### URL Parameter Conventions

- **`{survey_id}`** - UUID, used for admin operations (owner access)
- **`{slug}`** - URL-safe string, used for public/respondent access

## Data Models

### User
```json
{
  "id": "uuid",
  "github_id": "integer",
  "github_username": "string",
  "email": "string",
  "avatar_url": "string",
  "is_admin": "boolean",
  "created_at": "timestamp",
  "last_login_at": "timestamp"
}
```

### Survey
```json
{
  "id": "uuid",
  "slug": "string (unique, URL-safe)",
  "title": "string",
  "description": "string",
  "config": "jsonb (full survey JSON)",
  "created_by": "uuid (user.id)",
  "opens_at": "timestamp (nullable)",
  "closes_at": "timestamp (nullable)",
  "deleted_at": "timestamp (nullable, for soft delete)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Response
```json
{
  "id": "uuid",
  "survey_id": "uuid",
  "user_id": "uuid",
  "answers": "jsonb",
  "is_draft": "boolean (true=auto-saved, false=submitted)",
  "submitted_at": "timestamp (nullable, set when is_draft becomes false)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Survey JSON Schema

Surveys are defined in JSON with this structure:

```json
{
  "survey_title": "string",
  "description": "string",
  "vectors": [
    {
      "vector_id": "string",
      "vector_name": "string",
      "pairing_strategy": "match | complement",
      "questions": [
        {
          "question_id": "string",
          "question": "string",
          "type": "scale_1_5 | single_choice | multi_checkbox | dropdown | single_choice_with_text | open_text",
          "options": ["array of strings (for choice types)"],
          "text_prompt": "string (for single_choice_with_text)",
          "required": "boolean (default: true)"
        }
      ]
    }
  ]
}
```

### Question Types

| Type | Display | Stored Value |
|------|---------|--------------|
| `scale_1_5` | 5-point radio/slider (1=Low, 5=High) | Integer 1-5 |
| `single_choice` | Radio buttons | String |
| `multi_checkbox` | Checkboxes | Array of strings |
| `dropdown` | Select dropdown | String |
| `single_choice_with_text` | Radio + conditional text | `{choice: string, text: string}` |
| `open_text` | Textarea (max 1000 chars) | String |

## Authentication Flow

1. Frontend redirects to `GET /api/v1/auth/github`
2. Backend redirects to GitHub OAuth authorization
3. User authorizes on GitHub
4. GitHub redirects to `GET /api/v1/auth/github/callback`
5. Backend exchanges code for token, fetches user info
6. Backend creates/updates user record, issues JWT
7. Backend redirects to frontend with JWT in HTTP-only cookie
8. Frontend calls `GET /api/v1/auth/me` to get user info

## Environment Variables

### Backend (Railway)
```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=https://backend.railway.app/api/v1/auth/github/callback
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
JWT_SECRET=long-random-string
JWT_EXPIRY_HOURS=24
JWT_COOKIE_NAME=surveyflow_token
FRONTEND_URL=https://frontend.vercel.app
ALLOWED_GITHUB_ORGS=org1,org2  # Optional
```

### Frontend (Vercel)
```
VITE_API_URL=https://backend.railway.app/api/v1
```

## Development Workflow

### Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Branch Strategy

- `main` - production-ready code
- `feature/*` - feature branches
- `fix/*` - bug fix branches

### Commit Messages

Use conventional commits:
- `feat: add survey export`
- `fix: resolve auth redirect issue`
- `docs: update API documentation`
- `refactor: simplify question renderer`

## Security Requirements

- Store OAuth tokens server-side only
- Use HTTP-only cookies for JWT
- Implement CSRF protection
- Use parameterized queries (SQLAlchemy ORM)
- Sanitize user input to prevent XSS
- HTTPS only in production
- Rate limit login attempts

## Key Files Reference

| Purpose | Backend | Frontend |
|---------|---------|----------|
| Entry point | `app/main.py` | `src/main.jsx` |
| Config | `app/config.py` | `vite.config.js` |
| Auth | `app/routers/auth.py` | `src/api/auth.js` |
| Survey CRUD | `app/routers/surveys.py` | `src/pages/AdminDashboard.jsx` |
| Survey render | - | `src/components/SurveyForm.jsx` |
| Question types | - | `src/components/QuestionRenderer.jsx` |
| Database models | `app/models/` | - |
| API client | - | `src/api/` |

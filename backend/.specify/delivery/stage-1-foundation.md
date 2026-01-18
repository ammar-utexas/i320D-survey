# Stage 1: Foundation & Authentication

**Status**: Not Started
**Priority**: P0 (Critical Path)
**Estimated Scope**: Project setup + authentication infrastructure
**Dependencies**: None (first stage)
**Coordinates With**: Frontend Stage 1 (Foundation & Authentication)

## Objective

Establish the backend foundation with database connectivity, GitHub OAuth authentication, and JWT session management. At the end of this stage, the frontend can authenticate users via GitHub and maintain sessions.

## Demo Checkpoint

**Combined with Frontend Stage 1:**
- User clicks "Sign in with GitHub" on frontend
- Backend redirects to GitHub OAuth
- After authorization, backend issues JWT in HTTP-only cookie
- Frontend displays authenticated user with avatar
- Logout clears session

## Deliverables

### 1.1 Project Setup

| Task | Description | Files |
|------|-------------|-------|
| Initialize FastAPI project | Create app structure with async support | `app/__init__.py`, `app/main.py` |
| Configure pydantic-settings | Environment variable management | `app/config.py` |
| Setup async SQLAlchemy | Database engine, session factory | `app/database.py` |
| Initialize Alembic | Migration infrastructure | `alembic.ini`, `alembic/env.py` |
| Create requirements.txt | All dependencies pinned | `requirements.txt` |
| Create Dockerfile | Production container | `Dockerfile` |
| Create railway.toml | Railway deployment config | `railway.toml` |

**Dependencies (requirements.txt)**:
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy[asyncio]>=2.0.25
asyncpg>=0.29.0
alembic>=1.13.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
authlib>=1.3.0
httpx>=0.26.0
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.6
```

### 1.2 Configuration

**File**: `app/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # GitHub OAuth
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_CALLBACK_URL: str

    # JWT
    JWT_SECRET: str
    JWT_EXPIRY_HOURS: int = 24
    JWT_ALGORITHM: str = "HS256"

    # CORS
    FRONTEND_URL: str

    # Optional: Restrict to GitHub orgs
    ALLOWED_GITHUB_ORGS: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
```

### 1.3 Database Setup

**File**: `app/database.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

### 1.4 User Model

**File**: `app/models/user.py`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, default uuid4 | Internal identifier |
| github_id | Integer | Unique, Not Null | GitHub user ID |
| github_username | String | Not Null | GitHub login name |
| email | String | Nullable | Email from GitHub |
| avatar_url | String | Nullable | GitHub avatar URL |
| is_admin | Boolean | Default False | Admin privileges |
| created_at | DateTime | Default now | Account creation |
| last_login_at | DateTime | Auto-update | Last login timestamp |

**Migration**: `alembic revision --autogenerate -m "create users table"`

### 1.5 User Schemas

**File**: `app/schemas/user.py`

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class UserResponse(BaseModel):
    id: UUID
    github_username: str
    email: str | None
    avatar_url: str | None
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)
```

### 1.6 GitHub OAuth Service

**File**: `app/services/github.py`

**Functions**:
| Function | Purpose |
|----------|---------|
| `get_oauth_client()` | Configure Authlib OAuth client |
| `get_authorization_url()` | Generate GitHub auth URL with state |
| `exchange_code_for_token(code)` | Exchange auth code for access token |
| `get_github_user(token)` | Fetch user profile from GitHub API |
| `check_org_membership(token, orgs)` | Verify user belongs to allowed orgs |

**GitHub API endpoints used**:
- `https://github.com/login/oauth/authorize`
- `https://github.com/login/oauth/access_token`
- `https://api.github.com/user`
- `https://api.github.com/user/orgs` (if org restriction enabled)

### 1.7 JWT Security Utilities

**File**: `app/utils/security.py`

**Functions**:
| Function | Purpose |
|----------|---------|
| `create_access_token(user_id)` | Generate JWT with user ID claim |
| `decode_access_token(token)` | Validate and decode JWT |
| `get_current_user(db, request)` | Dependency: extract user from cookie |
| `get_current_admin(user)` | Dependency: verify user is admin |

**JWT Payload**:
```json
{
  "sub": "user-uuid",
  "exp": 1706000000,
  "iat": 1705913600
}
```

### 1.8 Auth Router

**File**: `app/routers/auth.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/github` | GET | Redirect to GitHub OAuth |
| `/auth/github/callback` | GET | Handle callback, issue JWT cookie |
| `/auth/logout` | POST | Clear JWT cookie |
| `/auth/me` | GET | Return current user info |

**Cookie Settings**:
```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=True,  # HTTPS only in production
    samesite="lax",
    max_age=settings.JWT_EXPIRY_HOURS * 3600,
)
```

### 1.9 Health Endpoint

**File**: `app/routers/health.py`

```python
@router.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 1.10 Main Application

**File**: `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, health

app = FastAPI(title="SurveyFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
```

## Acceptance Criteria

- [ ] `uvicorn app.main:app --reload` starts server at localhost:8000
- [ ] `GET /api/v1/health` returns `{"status": "healthy"}`
- [ ] `GET /api/v1/auth/github` redirects to GitHub OAuth
- [ ] OAuth callback creates/updates user and sets JWT cookie
- [ ] `GET /api/v1/auth/me` returns user info when authenticated
- [ ] `GET /api/v1/auth/me` returns 401 when not authenticated
- [ ] `POST /api/v1/auth/logout` clears cookie
- [ ] Database migration creates users table
- [ ] CORS allows frontend origin with credentials

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Security-First | HTTP-only cookies, server-side OAuth tokens, HTTPS |
| II. Type Safety | Pydantic schemas, type hints on all functions |
| III. Async-First | Async SQLAlchemy, async route handlers |
| IV. Testing | Fixtures for auth, test database isolation |
| V. Code Quality | Black, Ruff, MyPy configured |
| VI. RESTful API | Versioned endpoints, proper status codes |

## Testing Checklist

- [ ] Health endpoint returns 200
- [ ] OAuth redirect URL contains correct client_id
- [ ] User created on first login
- [ ] User updated on subsequent logins
- [ ] JWT cookie set with correct attributes
- [ ] Protected endpoint returns 401 without cookie
- [ ] Protected endpoint returns user with valid cookie
- [ ] Logout clears cookie

## Files Created

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── health.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── github.py
│   └── utils/
│       ├── __init__.py
│       └── security.py
├── alembic/
│   ├── versions/
│   │   └── 001_create_users_table.py
│   └── env.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_auth.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── railway.toml
└── .env.example
```

## Next Stage

Upon completion, proceed to **Stage 2: Survey Public API** (survey rendering and response submission for respondents).

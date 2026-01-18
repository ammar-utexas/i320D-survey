# Backend - FastAPI Application

## Tech Stack

- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0 (async)
- **Migrations:** Alembic
- **Database:** PostgreSQL
- **Auth:** Authlib (GitHub OAuth), python-jose (JWT)
- **Validation:** Pydantic v2

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, routers
│   ├── config.py            # Settings via pydantic-settings
│   ├── database.py          # Async SQLAlchemy engine & session
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── survey.py
│   │   └── response.py
│   ├── schemas/             # Pydantic request/response models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── survey.py
│   │   └── response.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── surveys.py
│   │   └── responses.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── github.py        # GitHub OAuth logic
│   │   └── export.py        # CSV/JSON export
│   └── utils/
│       ├── __init__.py
│       └── security.py      # JWT encode/decode
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── test_auth.py
│   ├── test_surveys.py
│   └── test_responses.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── railway.toml
```

## Coding Conventions

### Python Style

- Follow PEP 8
- Use type hints everywhere
- Max line length: 88 (Black formatter)
- Use `async`/`await` for all database operations

### Naming

- Files: `snake_case.py`
- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`

### Imports Order

```python
# Standard library
import uuid
from datetime import datetime

# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from app.database import get_db
from app.models.user import User
```

## Key Patterns

### Router Structure

```python
# app/routers/surveys.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.survey import Survey
from app.schemas.survey import SurveyCreate, SurveyResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/surveys", tags=["surveys"])

@router.post("/", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(
    survey: SurveyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Implementation
    pass
```

### Pydantic Schemas

```python
# app/schemas/survey.py
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class SurveyBase(BaseModel):
    title: str
    description: str | None = None

class SurveyCreate(SurveyBase):
    config: dict  # JSON survey config

class SurveyResponse(SurveyBase):
    id: UUID
    slug: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### SQLAlchemy Models

```python
# app/models/survey.py
from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base

class Survey(Base):
    __tablename__ = "surveys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    config = Column(JSON, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    opens_at = Column(DateTime)
    closes_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="surveys")
    responses = relationship("Response", back_populates="survey")
```

### Dependency Injection

```python
# app/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

### Error Handling

```python
from fastapi import HTTPException, status

# Not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Survey not found"
)

# Unauthorized
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid credentials",
    headers={"WWW-Authenticate": "Bearer"}
)

# Forbidden
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Not authorized to access this resource"
)

# Validation error
raise HTTPException(
    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    detail="Invalid survey configuration"
)
```

## Database Migrations

### Create Migration
```bash
alembic revision --autogenerate -m "add surveys table"
```

### Run Migrations
```bash
alembic upgrade head
```

### Rollback
```bash
alembic downgrade -1
```

## Testing

### Run Tests
```bash
pytest
pytest -v                    # Verbose
pytest tests/test_auth.py    # Specific file
pytest -k "test_create"      # By name pattern
```

### Test Fixtures

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost/test_db"

@pytest.fixture
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

## Local Development

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/surveyflow
GITHUB_CLIENT_ID=your_dev_client_id
GITHUB_CLIENT_SECRET=your_dev_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/v1/auth/github/callback
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRY_HOURS=24
FRONTEND_URL=http://localhost:5173
```

### Run Server
```bash
uvicorn app.main:app --reload --port 8000
```

### API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment (Railway)

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### railway.toml
```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/v1/health"
restartPolicyType = "on_failure"
```

## Common Commands

```bash
# Format code
black app/ tests/

# Lint
ruff check app/ tests/

# Type check
mypy app/

# Run all checks
black app/ tests/ && ruff check app/ tests/ && mypy app/ && pytest
```

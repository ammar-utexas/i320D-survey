# Data Model: Backend Foundation & Authentication

**Feature**: 001-backend-foundation
**Date**: 2026-01-18

## Entities

### User

Represents an authenticated person in the system who has completed GitHub OAuth.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default uuid4() | Internal unique identifier |
| github_id | Integer | UNIQUE, NOT NULL, indexed | GitHub's user ID (stable identifier) |
| github_username | String(255) | NOT NULL | GitHub login name (can change) |
| email | String(255) | NULLABLE | Email from GitHub profile (may be null if private) |
| avatar_url | String(500) | NULLABLE | URL to GitHub avatar image |
| is_admin | Boolean | NOT NULL, default False | Administrative privileges flag |
| created_at | DateTime(tz) | NOT NULL, default now() | Account creation timestamp |
| last_login_at | DateTime(tz) | NOT NULL, auto-update | Most recent login timestamp |

#### Indexes

| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| pk_users | id | Primary | Row lookup |
| ix_users_github_id | github_id | Unique | OAuth login lookup |

#### Validation Rules

- `github_id`: Must be positive integer from GitHub API
- `github_username`: Non-empty string, max 39 characters (GitHub limit)
- `email`: Valid email format when present; null allowed
- `avatar_url`: Valid URL format when present; null allowed
- `is_admin`: Only modifiable via direct database update (clarification from spec)

#### State Transitions

```
[New User]
    │
    ▼
┌─────────────────┐
│   CREATED       │ ◄─── First OAuth login
│   is_admin=false│
└────────┬────────┘
         │
         │ Manual DB update
         ▼
┌─────────────────┐
│   ADMIN         │
│   is_admin=true │
└─────────────────┘
```

Note: No automated state transitions. Admin promotion requires direct database modification.

## Relationships

### Stage 1 (This Feature)

```
User (standalone)
```

No relationships in Stage 1. User is the only entity.

### Future Stages (Reference)

```
User
  │
  ├──< Survey (created_by)     # Stage 3
  │
  └──< Response (user_id)      # Stage 2
```

## SQLAlchemy Model

```python
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    github_id = Column(Integer, unique=True, nullable=False, index=True)
    github_username = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<User {self.github_username}>"
```

## Migration

### Up (001_create_users_table.py)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id INTEGER UNIQUE NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url VARCHAR(500),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_users_github_id ON users (github_id);
```

### Down

```sql
DROP INDEX IF EXISTS ix_users_github_id;
DROP TABLE IF EXISTS users;
```

## Pydantic Schemas

### UserResponse (API output)

```python
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    """User data returned to frontend."""
    id: UUID
    github_username: str
    email: str | None
    avatar_url: str | None
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)
```

### UserCreate (Internal use only)

```python
class UserCreate(BaseModel):
    """Internal schema for creating/updating users from GitHub data."""
    github_id: int
    github_username: str
    email: str | None = None
    avatar_url: str | None = None
```

Note: `UserCreate` is not exposed via API. Users are only created through OAuth flow.

## Data Operations

### Create User (First Login)

```python
async def create_user(db: AsyncSession, github_user: dict) -> User:
    user = User(
        github_id=github_user["id"],
        github_username=github_user["login"],
        email=github_user.get("email"),
        avatar_url=github_user.get("avatar_url"),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
```

### Update User (Returning Login)

```python
async def update_user_login(db: AsyncSession, user: User, github_user: dict) -> User:
    user.github_username = github_user["login"]
    user.email = github_user.get("email")
    user.avatar_url = github_user.get("avatar_url")
    user.last_login_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return user
```

### Find User by GitHub ID

```python
async def get_user_by_github_id(db: AsyncSession, github_id: int) -> User | None:
    result = await db.execute(
        select(User).where(User.github_id == github_id)
    )
    return result.scalar_one_or_none()
```

### Find User by Internal ID

```python
async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()
```

# Stage 3: Admin Survey CRUD

**Status**: Not Started
**Priority**: P0 (Critical Path)
**Estimated Scope**: Survey creation, update, delete, duplicate
**Dependencies**: Stage 1 (Foundation & Authentication), Stage 2 (Survey Public API)
**Coordinates With**: Frontend Stage 4 (Admin Dashboard Core)

## Objective

Build the admin API for creating, managing, and deleting surveys. At the end of this stage, admins can upload survey JSON configs, get shareable URLs, and manage their surveys.

## Demo Checkpoint

**Combined with Frontend Stage 4:**
- Admin uploads JSON survey configuration
- Backend validates JSON and creates survey with unique slug
- Admin sees survey in dashboard with shareable URL
- Admin can edit survey title/description
- Admin can duplicate and delete surveys

## Deliverables

### 3.1 Admin Survey Schemas

**File**: `app/schemas/survey.py` (extend)

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class SurveyCreate(BaseModel):
    """Request body for creating a survey"""
    title: str
    description: str | None = None
    config: dict  # Full survey JSON config
    opens_at: datetime | None = None
    closes_at: datetime | None = None

class SurveyUpdate(BaseModel):
    """Request body for updating survey metadata"""
    title: str | None = None
    description: str | None = None
    opens_at: datetime | None = None
    closes_at: datetime | None = None

class SurveyAdminResponse(BaseModel):
    """Survey data for admin views"""
    id: UUID
    slug: str
    title: str
    description: str | None
    config: dict
    opens_at: datetime | None
    closes_at: datetime | None
    created_at: datetime
    updated_at: datetime
    response_count: int  # Computed field

    model_config = ConfigDict(from_attributes=True)

class SurveyListItem(BaseModel):
    """Survey summary for list views"""
    id: UUID
    slug: str
    title: str
    opens_at: datetime | None
    closes_at: datetime | None
    response_count: int  # Total responses (draft + submitted)
    completed_count: int  # Submitted responses (is_draft=False)
    is_open: bool  # Computed: within open/close window

    model_config = ConfigDict(from_attributes=True)
```

### 3.2 Survey Service (Admin)

**File**: `app/services/survey.py` (extend)

```python
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from slugify import slugify

from app.models.survey import Survey
from app.models.response import Response

async def create_survey(
    db: AsyncSession,
    user_id: UUID,
    title: str,
    description: str | None,
    config: dict,
    opens_at: datetime | None,
    closes_at: datetime | None,
) -> Survey:
    """Create new survey with unique slug"""
    base_slug = slugify(title, max_length=80)
    slug = await generate_unique_slug(db, base_slug)

    survey = Survey(
        slug=slug,
        title=title,
        description=description,
        config=config,
        created_by=user_id,
        opens_at=opens_at,
        closes_at=closes_at,
    )
    db.add(survey)
    await db.commit()
    await db.refresh(survey)
    return survey

async def generate_unique_slug(db: AsyncSession, base_slug: str) -> str:
    """Generate unique slug, appending number if needed"""
    slug = base_slug
    counter = 1
    while True:
        exists = await db.execute(
            select(Survey).where(Survey.slug == slug)
        )
        if not exists.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1

async def get_admin_surveys(db: AsyncSession, user_id: UUID) -> list[Survey]:
    """Get all surveys created by admin with response counts"""
    stmt = (
        select(
            Survey,
            func.count(Response.id).label('response_count'),
            func.count(Response.id).filter(Response.is_draft == False).label('completed_count')
        )
        .outerjoin(Response)
        .where(Survey.created_by == user_id, Survey.deleted_at.is_(None))
        .group_by(Survey.id)
        .order_by(Survey.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.all()

async def update_survey(
    db: AsyncSession,
    survey: Survey,
    updates: dict,
) -> Survey:
    """Update survey metadata (not config)"""
    for key, value in updates.items():
        if value is not None:
            setattr(survey, key, value)
    survey.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(survey)
    return survey

async def soft_delete_survey(db: AsyncSession, survey: Survey) -> None:
    """Soft delete survey by setting deleted_at"""
    survey.deleted_at = datetime.utcnow()
    await db.commit()

async def duplicate_survey(
    db: AsyncSession,
    survey: Survey,
    user_id: UUID,
    new_title: str | None = None,
) -> Survey:
    """Create copy of survey with new slug"""
    title = new_title or f"{survey.title} (Copy)"
    return await create_survey(
        db=db,
        user_id=user_id,
        title=title,
        description=survey.description,
        config=survey.config,
        opens_at=None,
        closes_at=None,
    )
```

### 3.3 Surveys Router (Admin)

**File**: `app/routers/surveys.py`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/surveys` | POST | Admin | Create survey from JSON |
| `/surveys` | GET | Admin | List admin's surveys |
| `/surveys/{survey_id}` | GET | Admin | Get survey details |
| `/surveys/{survey_id}` | PATCH | Admin | Update survey metadata |
| `/surveys/{survey_id}` | DELETE | Admin | Soft delete survey |
| `/surveys/{survey_id}/duplicate` | POST | Admin | Duplicate survey |

### 3.4 Admin Authorization

**File**: `app/utils/security.py` (extend)

```python
async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency that requires user to be admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
```

### 3.5 Slug Generation

**Add to requirements.txt**: `python-slugify>=8.0.1`

## Acceptance Criteria

- [ ] `POST /api/v1/surveys` creates survey with valid JSON config
- [ ] `POST /api/v1/surveys` returns 422 with errors for invalid config
- [ ] `POST /api/v1/surveys` generates unique slug from title
- [ ] `GET /api/v1/surveys` returns only current admin's surveys
- [ ] `GET /api/v1/surveys` excludes soft-deleted surveys
- [ ] `GET /api/v1/surveys/{id}` returns survey details with response count
- [ ] `GET /api/v1/surveys/{id}` returns 403 for other admin's survey
- [ ] `PATCH /api/v1/surveys/{id}` updates metadata only
- [ ] `DELETE /api/v1/surveys/{id}` soft deletes (sets deleted_at)
- [ ] `POST /api/v1/surveys/{id}/duplicate` creates copy with new slug

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Security-First | Admin auth required, ownership validation |
| II. Type Safety | Pydantic schemas for all requests/responses |
| III. Async-First | Async database operations throughout |
| IV. Testing | Test fixtures for admin surveys |
| V. Code Quality | Service layer separated from routes |
| VI. RESTful API | Standard CRUD endpoints with proper status codes |
| VII. Simplicity | Minimal implementation, no over-engineering |

## Testing Checklist

- [ ] Create survey with valid config returns 201
- [ ] Create survey with invalid config returns 422 with errors
- [ ] Slug generation handles duplicates
- [ ] List surveys filters by current admin
- [ ] List surveys excludes deleted surveys
- [ ] Get survey returns 404 for deleted survey
- [ ] Get survey returns 403 for other admin's survey
- [ ] Update survey modifies only specified fields
- [ ] Delete survey sets deleted_at timestamp
- [ ] Duplicate survey creates independent copy

## Files Created/Modified

```
backend/
├── app/
│   ├── routers/
│   │   ├── __init__.py (modified)
│   │   └── surveys.py (new)
│   ├── schemas/
│   │   └── survey.py (extended)
│   ├── services/
│   │   └── survey.py (extended)
│   └── utils/
│       └── security.py (extended)
├── requirements.txt (modified: add python-slugify)
└── tests/
    └── test_surveys.py (new)
```

## Next Stage

Upon completion, proceed to **Stage 4: Export & Response Management**.

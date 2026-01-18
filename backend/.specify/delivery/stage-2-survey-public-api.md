# Stage 2: Survey Public API (Respondent)

**Status**: Not Started
**Priority**: P0 (Critical Path)
**Estimated Scope**: Survey retrieval and response submission
**Dependencies**: Stage 1 (Foundation & Authentication)
**Coordinates With**: Frontend Stages 2-3 (Question Components, Survey Response Features)

## Objective

Build the public-facing survey API that allows authenticated respondents to view surveys and submit/update responses. At the end of this stage, users can complete surveys with auto-save functionality.

## Demo Checkpoint

**Combined with Frontend Stages 2-3:**
- User navigates to `/s/:slug` and sees survey form
- All 6 question types render with data from backend
- User fills out survey, responses auto-save (upsert)
- Returning user sees their previous answers pre-filled
- Progress bar updates based on answered questions
- Survey respects open/close dates

## Deliverables

### 2.1 Survey Model

**File**: `app/models/survey.py`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, default uuid4 | Internal identifier |
| slug | String(100) | Unique, Not Null, Index | URL-safe identifier |
| title | String(255) | Not Null | Survey title |
| description | Text | Nullable | Survey description |
| config | JSONB | Not Null | Full survey JSON config |
| created_by | UUID | FK(users.id), Not Null | Admin who created |
| opens_at | DateTime | Nullable | When survey opens |
| closes_at | DateTime | Nullable | When survey closes |
| deleted_at | DateTime | Nullable | Soft delete timestamp |
| created_at | DateTime | Default now | Creation timestamp |
| updated_at | DateTime | Auto-update | Last modification |

**Relationships**:
- `creator`: Many-to-One with User
- `responses`: One-to-Many with Response

**Migration**: `alembic revision --autogenerate -m "create surveys table"`

### 2.2 Response Model

**File**: `app/models/response.py`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, default uuid4 | Internal identifier |
| survey_id | UUID | FK(surveys.id), Not Null | Associated survey |
| user_id | UUID | FK(users.id), Not Null | Respondent |
| answers | JSONB | Not Null, Default {} | Answer data |
| is_draft | Boolean | Default True | True=auto-saved, False=submitted |
| submitted_at | DateTime | Nullable | Final submission time |
| created_at | DateTime | Default now | First save |
| updated_at | DateTime | Auto-update | Last update |

**Constraints**:
- Unique constraint on (survey_id, user_id) - one response per user per survey

**Migration**: `alembic revision --autogenerate -m "create responses table"`

### 2.3 Survey Schemas (Public)

**File**: `app/schemas/survey.py`

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class SurveyPublicResponse(BaseModel):
    """Survey data for respondents (no admin fields)"""
    slug: str
    title: str
    description: str | None
    config: dict  # Full JSON config for rendering
    opens_at: datetime | None
    closes_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
```

### 2.4 Response Schemas

**File**: `app/schemas/response.py`

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ResponseSubmit(BaseModel):
    """Request body for submitting/updating response"""
    answers: dict  # { question_id: answer_value }

class ResponseData(BaseModel):
    """Response data returned to user"""
    answers: dict
    is_draft: bool  # True=auto-saved, False=submitted
    submitted_at: datetime | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### 2.5 Survey Availability Service

**File**: `app/services/survey.py`

```python
from datetime import datetime
from fastapi import HTTPException, status

def check_survey_availability(survey):
    """Raise HTTPException if survey is not available"""
    now = datetime.utcnow()

    if survey.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    if survey.opens_at and now < survey.opens_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This survey is not yet open",
            headers={"X-Survey-Opens": survey.opens_at.isoformat()}
        )

    if survey.closes_at and now > survey.closes_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This survey is closed",
            headers={"X-Survey-Closed": survey.closes_at.isoformat()}
        )
```

### 2.6 Response Service

**File**: `app/services/response.py`

```python
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.models.response import Response

async def upsert_response(
    db: AsyncSession,
    survey_id: UUID,
    user_id: UUID,
    answers: dict
) -> Response:
    """Create or update response (auto-save friendly)"""
    stmt = insert(Response).values(
        survey_id=survey_id,
        user_id=user_id,
        answers=answers,
    ).on_conflict_do_update(
        index_elements=['survey_id', 'user_id'],
        set_={'answers': answers, 'updated_at': datetime.utcnow()}
    ).returning(Response)

    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one()

async def get_user_response(
    db: AsyncSession,
    survey_id: UUID,
    user_id: UUID
) -> Response | None:
    """Get user's existing response for a survey"""
    stmt = select(Response).where(
        Response.survey_id == survey_id,
        Response.user_id == user_id
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
```

### 2.7 Responses Router

**File**: `app/routers/responses.py`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/surveys/{slug}/public` | GET | No | Get survey config for rendering |
| `/surveys/{slug}/respond` | POST | Yes | Submit/update response (upsert) |
| `/surveys/{slug}/my-response` | GET | Yes | Get user's saved response |

**Implementation Details**:

```python
@router.get("/surveys/{slug}/public", response_model=SurveyPublicResponse)
async def get_public_survey(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get survey for rendering (no auth required)"""
    survey = await get_survey_by_slug(db, slug)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Check availability but allow viewing closed surveys
    # (frontend will show appropriate message)
    return survey

@router.post("/surveys/{slug}/respond", response_model=ResponseData)
async def submit_response(
    slug: str,
    body: ResponseSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit or update survey response (upsert)"""
    survey = await get_survey_by_slug(db, slug)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    check_survey_availability(survey)

    response = await upsert_response(
        db, survey.id, current_user.id, body.answers
    )
    return response

@router.get("/surveys/{slug}/my-response", response_model=ResponseData | None)
async def get_my_response(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's response for a survey"""
    survey = await get_survey_by_slug(db, slug)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    response = await get_user_response(db, survey.id, current_user.id)
    return response  # Returns None if no response exists
```

### 2.8 Survey Config Validation

**File**: `app/services/validation.py`

Validate survey JSON config structure:

```python
from pydantic import BaseModel, validator
from typing import Literal

class QuestionConfig(BaseModel):
    question_id: str
    question: str
    type: Literal[
        'scale_1_5', 'single_choice', 'multi_checkbox',
        'dropdown', 'single_choice_with_text', 'open_text'
    ]
    options: list[str] | None = None
    text_prompt: str | None = None
    required: bool = True

    @validator('options')
    def options_required_for_choice_types(cls, v, values):
        choice_types = {'single_choice', 'multi_checkbox', 'dropdown', 'single_choice_with_text'}
        if values.get('type') in choice_types and not v:
            raise ValueError(f"options required for type {values.get('type')}")
        return v

class VectorConfig(BaseModel):
    vector_id: str
    vector_name: str
    pairing_strategy: Literal['match', 'complement']
    questions: list[QuestionConfig]

class SurveyConfig(BaseModel):
    survey_title: str
    description: str | None = None
    vectors: list[VectorConfig]

def validate_survey_config(config: dict) -> list[str]:
    """Validate survey config, return list of errors"""
    try:
        SurveyConfig(**config)
        return []
    except ValidationError as e:
        return [f"{err['loc']}: {err['msg']}" for err in e.errors()]
```

### 2.9 Answer Validation

**File**: `app/services/validation.py` (extend)

```python
def validate_answers(config: dict, answers: dict) -> list[str]:
    """Validate answer data against survey config"""
    errors = []
    survey = SurveyConfig(**config)

    for vector in survey.vectors:
        for question in vector.questions:
            qid = question.question_id
            answer = answers.get(qid)

            # Check required
            if question.required and answer is None:
                errors.append(f"{qid}: required field missing")
                continue

            if answer is None:
                continue

            # Type-specific validation
            match question.type:
                case 'scale_1_5':
                    if not isinstance(answer, int) or answer < 1 or answer > 5:
                        errors.append(f"{qid}: must be integer 1-5")
                case 'single_choice' | 'dropdown':
                    if answer not in question.options:
                        errors.append(f"{qid}: invalid option")
                case 'multi_checkbox':
                    if not isinstance(answer, list):
                        errors.append(f"{qid}: must be array")
                    elif not all(a in question.options for a in answer):
                        errors.append(f"{qid}: contains invalid option")
                case 'single_choice_with_text':
                    if not isinstance(answer, dict):
                        errors.append(f"{qid}: must be object with choice and text")
                case 'open_text':
                    if not isinstance(answer, str) or len(answer) > 1000:
                        errors.append(f"{qid}: must be string <= 1000 chars")

    return errors
```

### 2.10 Rate Limiting (Optional)

**File**: `app/utils/rate_limit.py`

Basic rate limiting for response submission to prevent abuse:

```python
from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta

# Simple in-memory rate limiter (use Redis in production)
request_counts: dict[str, list[datetime]] = defaultdict(list)

async def rate_limit_responses(request: Request, limit: int = 60, window: int = 60):
    """Limit to {limit} requests per {window} seconds per IP"""
    client_ip = request.client.host
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=window)

    # Clean old entries
    request_counts[client_ip] = [
        t for t in request_counts[client_ip] if t > cutoff
    ]

    if len(request_counts[client_ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

    request_counts[client_ip].append(now)
```

## Acceptance Criteria

- [ ] `GET /api/v1/surveys/{slug}/public` returns survey config
- [ ] `GET /api/v1/surveys/{slug}/public` returns 404 for non-existent slug
- [ ] `POST /api/v1/surveys/{slug}/respond` creates new response
- [ ] `POST /api/v1/surveys/{slug}/respond` updates existing response (upsert)
- [ ] `POST /api/v1/surveys/{slug}/respond` returns 401 without auth
- [ ] `POST /api/v1/surveys/{slug}/respond` returns 403 if survey closed
- [ ] `GET /api/v1/surveys/{slug}/my-response` returns user's response
- [ ] `GET /api/v1/surveys/{slug}/my-response` returns null if no response
- [ ] Survey config validation catches malformed JSON
- [ ] Answer validation catches type mismatches

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Security-First | Auth required for submission, rate limiting |
| II. Type Safety | Pydantic validation for config and answers |
| III. Async-First | Async database operations, upsert |
| IV. Testing | Test fixtures for surveys and responses |
| V. Code Quality | Validation service separated from routes |
| VI. RESTful API | Proper status codes (404, 403, 401) |

## Testing Checklist

- [ ] Public survey endpoint returns config
- [ ] Survey availability checked (open/close dates)
- [ ] Response upsert creates on first submission
- [ ] Response upsert updates on subsequent submissions
- [ ] User can only access their own response
- [ ] Invalid answers rejected with clear errors
- [ ] Rate limiting prevents rapid submissions

## Files Created/Modified

```
backend/
├── app/
│   ├── models/
│   │   ├── __init__.py (modified)
│   │   ├── survey.py (new)
│   │   └── response.py (new)
│   ├── schemas/
│   │   ├── __init__.py (modified)
│   │   ├── survey.py (new)
│   │   └── response.py (new)
│   ├── routers/
│   │   ├── __init__.py (modified)
│   │   └── responses.py (new)
│   ├── services/
│   │   ├── survey.py (new)
│   │   ├── response.py (new)
│   │   └── validation.py (new)
│   └── utils/
│       └── rate_limit.py (new)
├── alembic/
│   └── versions/
│       ├── 002_create_surveys_table.py
│       └── 003_create_responses_table.py
└── tests/
    ├── test_responses.py (new)
    └── test_validation.py (new)
```

## Next Stage

Upon completion, proceed to **Stage 3: Admin Survey CRUD** (survey creation and management for admins).

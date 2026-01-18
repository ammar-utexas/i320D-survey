# Stage 4: Responses & Export

**Status**: Not Started
**Priority**: P1 (High Value)
**Estimated Scope**: Response listing, pagination, export functionality
**Dependencies**: Stage 3 (Admin Survey CRUD)
**Coordinates With**: Frontend Stage 5 (Admin Advanced Features)

## Objective

Build the admin API for viewing survey responses with pagination/search and exporting data in CSV/JSON formats. At the end of this stage, admins can view all responses, search by username, and export data for algorithmic processing (e.g., student pairing).

## Demo Checkpoint

**Combined with Frontend Stage 5:**
- Admin views response table with pagination
- Admin searches responses by username
- Admin exports responses as JSON (for algorithms)
- Admin exports responses as CSV (for spreadsheets)
- Export includes all answer data properly formatted
- Optional: Date range filter and anonymization

## Deliverables

### 4.1 Response Schemas (Admin)

**File**: `app/schemas/response.py` (extend)

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ResponseListItem(BaseModel):
    """Response item in admin table view"""
    id: UUID
    user_id: UUID
    github_username: str
    email: str | None
    avatar_url: str | None
    answers: dict
    is_complete: bool
    submitted_at: datetime | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResponseListResponse(BaseModel):
    """Paginated response list"""
    items: list[ResponseListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class ExportParams(BaseModel):
    """Export filter parameters"""
    format: Literal['json', 'csv'] = 'json'
    start_date: datetime | None = None
    end_date: datetime | None = None
    anonymize: bool = False
```

### 4.2 Response List Service

**File**: `app/services/response.py` (extend)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload

from app.models.response import Response
from app.models.user import User

async def get_survey_responses(
    db: AsyncSession,
    survey_id: UUID,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
) -> tuple[list[Response], int]:
    """Get paginated responses with user info"""

    # Base query with user join
    base_query = (
        select(Response)
        .options(joinedload(Response.user))
        .where(Response.survey_id == survey_id)
    )

    # Apply search filter
    if search:
        base_query = base_query.join(User).where(
            User.github_username.ilike(f"%{search}%")
        )

    # Count total
    count_query = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Apply pagination
    query = (
        base_query
        .order_by(Response.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    responses = result.scalars().all()

    return responses, total

async def get_all_responses_for_export(
    db: AsyncSession,
    survey_id: UUID,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> list[Response]:
    """Get all responses for export (no pagination)"""

    query = (
        select(Response)
        .options(joinedload(Response.user))
        .where(Response.survey_id == survey_id)
    )

    if start_date:
        query = query.where(Response.updated_at >= start_date)
    if end_date:
        query = query.where(Response.updated_at <= end_date)

    query = query.order_by(Response.updated_at.asc())

    result = await db.execute(query)
    return result.scalars().all()
```

### 4.3 Export Service

**File**: `app/services/export.py`

```python
import csv
import json
from io import StringIO
from uuid import UUID, uuid4
from datetime import datetime

from app.models.response import Response
from app.models.survey import Survey

def anonymize_user_id(user_id: UUID, salt: str) -> str:
    """Generate consistent anonymous ID for user"""
    import hashlib
    combined = f"{user_id}{salt}"
    return hashlib.sha256(combined.encode()).hexdigest()[:12]

def export_responses_json(
    survey: Survey,
    responses: list[Response],
    anonymize: bool = False
) -> str:
    """Export responses as JSON"""
    salt = uuid4().hex if anonymize else None

    data = {
        "survey": {
            "slug": survey.slug,
            "title": survey.title,
            "exported_at": datetime.utcnow().isoformat(),
            "total_responses": len(responses),
        },
        "config": survey.config,
        "responses": []
    }

    for response in responses:
        response_data = {
            "response_id": str(response.id),
            "answers": response.answers,
            "is_complete": response.is_complete,
            "submitted_at": response.submitted_at.isoformat() if response.submitted_at else None,
            "updated_at": response.updated_at.isoformat(),
        }

        if anonymize:
            response_data["anonymous_id"] = anonymize_user_id(response.user_id, salt)
        else:
            response_data["user"] = {
                "id": str(response.user_id),
                "github_username": response.user.github_username,
                "email": response.user.email,
            }

        data["responses"].append(response_data)

    return json.dumps(data, indent=2)

def export_responses_csv(
    survey: Survey,
    responses: list[Response],
    anonymize: bool = False
) -> str:
    """Export responses as CSV"""
    salt = uuid4().hex if anonymize else None

    # Extract all question IDs from config
    question_ids = []
    for vector in survey.config.get("vectors", []):
        for question in vector.get("questions", []):
            question_ids.append(question["question_id"])

    output = StringIO()
    writer = csv.writer(output)

    # Header row
    if anonymize:
        header = ["anonymous_id"]
    else:
        header = ["github_username", "email"]

    header.extend(question_ids)
    header.extend(["is_complete", "submitted_at", "updated_at"])
    writer.writerow(header)

    # Data rows
    for response in responses:
        if anonymize:
            row = [anonymize_user_id(response.user_id, salt)]
        else:
            row = [response.user.github_username, response.user.email or ""]

        # Add answers in question order
        for qid in question_ids:
            answer = response.answers.get(qid, "")
            # Convert complex types to string
            if isinstance(answer, list):
                row.append("|".join(str(a) for a in answer))
            elif isinstance(answer, dict):
                row.append(json.dumps(answer))
            else:
                row.append(str(answer) if answer is not None else "")

        row.extend([
            response.is_complete,
            response.submitted_at.isoformat() if response.submitted_at else "",
            response.updated_at.isoformat(),
        ])
        writer.writerow(row)

    return output.getvalue()
```

### 4.4 Responses Admin Router

**File**: `app/routers/surveys.py` (extend)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/surveys/{survey_id}/responses` | GET | Admin | List responses with pagination |
| `/surveys/{survey_id}/export` | GET | Admin | Export responses as CSV/JSON |

**Implementation**:

```python
from fastapi import Query
from fastapi.responses import StreamingResponse
from io import BytesIO

from app.services.response import get_survey_responses, get_all_responses_for_export
from app.services.export import export_responses_json, export_responses_csv
from app.schemas.response import ResponseListResponse, ResponseListItem

@router.get("/{survey_id}/responses", response_model=ResponseListResponse)
async def list_survey_responses(
    survey_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """List survey responses with pagination and search"""
    survey = await get_survey_by_id(db, survey_id, current_user.id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    responses, total = await get_survey_responses(
        db, survey_id, page, page_size, search
    )

    total_pages = (total + page_size - 1) // page_size

    return ResponseListResponse(
        items=[
            ResponseListItem(
                id=r.id,
                user_id=r.user_id,
                github_username=r.user.github_username,
                email=r.user.email,
                avatar_url=r.user.avatar_url,
                answers=r.answers,
                is_complete=r.is_complete,
                submitted_at=r.submitted_at,
                updated_at=r.updated_at,
            )
            for r in responses
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

@router.get("/{survey_id}/export")
async def export_survey_responses(
    survey_id: UUID,
    format: Literal['json', 'csv'] = Query('json'),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    anonymize: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Export survey responses as JSON or CSV"""
    survey = await get_survey_by_id(db, survey_id, current_user.id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    responses = await get_all_responses_for_export(
        db, survey_id, start_date, end_date
    )

    if format == 'json':
        content = export_responses_json(survey, responses, anonymize)
        media_type = "application/json"
        filename = f"{survey.slug}-responses.json"
    else:
        content = export_responses_csv(survey, responses, anonymize)
        media_type = "text/csv"
        filename = f"{survey.slug}-responses.csv"

    return StreamingResponse(
        BytesIO(content.encode('utf-8')),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
```

### 4.5 Survey Statistics

**File**: `app/services/response.py` (extend)

```python
from dataclasses import dataclass

@dataclass
class SurveyStats:
    total_responses: int
    complete_responses: int
    incomplete_responses: int
    completion_rate: float
    first_response: datetime | None
    last_response: datetime | None

async def get_survey_stats(
    db: AsyncSession,
    survey_id: UUID
) -> SurveyStats:
    """Get statistics for a survey"""
    query = select(
        func.count(Response.id).label('total'),
        func.count(Response.id).filter(Response.is_complete == True).label('complete'),
        func.min(Response.created_at).label('first'),
        func.max(Response.updated_at).label('last'),
    ).where(Response.survey_id == survey_id)

    result = await db.execute(query)
    row = result.one()

    total = row.total or 0
    complete = row.complete or 0

    return SurveyStats(
        total_responses=total,
        complete_responses=complete,
        incomplete_responses=total - complete,
        completion_rate=complete / total if total > 0 else 0.0,
        first_response=row.first,
        last_response=row.last,
    )
```

### 4.6 Stats Endpoint

**File**: `app/routers/surveys.py` (extend)

```python
from app.services.response import get_survey_stats

class SurveyStatsResponse(BaseModel):
    total_responses: int
    complete_responses: int
    incomplete_responses: int
    completion_rate: float
    first_response: datetime | None
    last_response: datetime | None

@router.get("/{survey_id}/stats", response_model=SurveyStatsResponse)
async def get_survey_stats_endpoint(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get survey response statistics"""
    survey = await get_survey_by_id(db, survey_id, current_user.id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    stats = await get_survey_stats(db, survey_id)
    return stats
```

### 4.7 Response Model Relationship

**File**: `app/models/response.py` (extend)

Ensure user relationship is defined for eager loading:

```python
from sqlalchemy.orm import relationship

class Response(Base):
    # ... existing columns ...

    # Relationships
    survey = relationship("Survey", back_populates="responses")
    user = relationship("User", back_populates="responses")
```

**File**: `app/models/user.py` (extend)

```python
class User(Base):
    # ... existing columns ...

    # Relationships
    surveys = relationship("Survey", back_populates="creator")
    responses = relationship("Response", back_populates="user")
```

## Acceptance Criteria

- [ ] `GET /api/v1/surveys/{id}/responses` returns paginated responses
- [ ] Pagination params work (page, page_size)
- [ ] Search filters by username (case-insensitive)
- [ ] Response list includes user info (username, email, avatar)
- [ ] `GET /api/v1/surveys/{id}/export?format=json` downloads JSON file
- [ ] `GET /api/v1/surveys/{id}/export?format=csv` downloads CSV file
- [ ] Export includes all answer data properly formatted
- [ ] Date range filter limits exported responses
- [ ] Anonymize option removes PII and uses hashed IDs
- [ ] `GET /api/v1/surveys/{id}/stats` returns completion statistics
- [ ] Only survey owner can access responses

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Security-First | Admin-only access, anonymization option |
| II. Type Safety | Pydantic schemas, typed export functions |
| III. Async-First | Async database queries with joins |
| IV. Testing | Test export formats, pagination, search |
| V. Code Quality | Export service separated from routes |
| VI. RESTful API | Query params for filters, proper content types |
| VII. Simplicity | StreamingResponse for efficient exports |

## Testing Checklist

- [ ] Response list returns correct pagination metadata
- [ ] Search filters responses by username
- [ ] JSON export contains all response data
- [ ] CSV export has correct headers and values
- [ ] Multi-value answers formatted correctly in CSV
- [ ] Date range filter works
- [ ] Anonymized export has no PII
- [ ] Stats endpoint returns accurate counts
- [ ] Large exports don't timeout

## Files Created/Modified

```
backend/
├── app/
│   ├── schemas/
│   │   └── response.py (extended)
│   ├── routers/
│   │   └── surveys.py (extended - responses, export, stats)
│   ├── services/
│   │   ├── response.py (extended - list, stats)
│   │   └── export.py (new)
│   └── models/
│       ├── response.py (extended - relationships)
│       └── user.py (extended - relationships)
└── tests/
    ├── test_responses_admin.py (new)
    └── test_export.py (new)
```

## Post-Stage: Polish & Testing

After Stage 4, the backend is feature-complete. Final polish includes:
- End-to-end testing of all flows
- Performance testing for large exports
- Security audit (auth, authorization)
- API documentation review (OpenAPI/Swagger)
- Error message consistency check
- Rate limiting for export endpoints

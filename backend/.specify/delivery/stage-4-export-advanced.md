# Stage 4: Export & Response Management

**Status**: Not Started
**Priority**: P1
**Estimated Scope**: Response listing, JSON/CSV export, filtering
**Dependencies**: Stage 3 (Admin Survey CRUD)
**Coordinates With**: Frontend Stage 5 (Admin Advanced Features)

## Objective

Build the admin API for viewing responses and exporting data. At the end of this stage, admins can view all responses to their surveys and export them as JSON or CSV.

## Demo Checkpoint

**Combined with Frontend Stage 5:**
- Admin views response table with pagination
- Admin exports responses as JSON file
- Admin exports responses as CSV file
- Admin can filter export by date range
- Admin can choose anonymized export

## Deliverables

### 4.1 Response Schemas (Admin)

**File**: `app/schemas/response.py` (extend)

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ResponseListItem(BaseModel):
    """Response summary for admin list view"""
    id: UUID
    user_id: UUID
    github_username: str
    email: str | None
    avatar_url: str | None
    is_draft: bool
    submitted_at: datetime | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResponseDetail(BaseModel):
    """Full response for admin view"""
    id: UUID
    user_id: UUID
    github_username: str
    email: str | None
    answers: dict
    is_draft: bool
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResponseListResponse(BaseModel):
    """Paginated response list"""
    items: list[ResponseListItem]
    total: int
    limit: int
    offset: int
```

### 4.2 Response Service (Admin)

**File**: `app/services/response.py` (extend)

```python
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import joinedload

from app.models.response import Response
from app.models.user import User

async def get_survey_responses(
    db: AsyncSession,
    survey_id: UUID,
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
    status: str | None = None,  # 'completed', 'draft', or 'all'
) -> tuple[list[Response], int]:
    """Get paginated responses for a survey with user info and filters"""
    # Base query
    base_query = (
        select(Response)
        .options(joinedload(Response.user))
        .join(User, Response.user_id == User.id)
        .where(Response.survey_id == survey_id)
    )

    # Apply search filter (username or email)
    if search:
        search_term = f"%{search}%"
        base_query = base_query.where(
            or_(
                User.github_username.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    # Apply status filter
    if status == 'completed':
        base_query = base_query.where(Response.is_draft == False)
    elif status == 'draft':
        base_query = base_query.where(Response.is_draft == True)
    # 'all' or None = no filter

    # Count total (with filters applied)
    count_stmt = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_stmt)).scalar()

    # Apply pagination and ordering
    stmt = (
        base_query
        .order_by(Response.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    responses = result.scalars().all()

    return responses, total

async def get_all_responses_for_export(
    db: AsyncSession,
    survey_id: UUID,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
) -> list[Response]:
    """Get all responses for export with optional date filter"""
    stmt = (
        select(Response)
        .options(joinedload(Response.user))
        .where(Response.survey_id == survey_id)
        .order_by(Response.submitted_at)
    )

    if from_date:
        stmt = stmt.where(Response.submitted_at >= from_date)
    if to_date:
        stmt = stmt.where(Response.submitted_at <= to_date)

    result = await db.execute(stmt)
    return result.scalars().all()
```

### 4.3 Export Service

**File**: `app/services/export.py`

```python
import csv
import json
from io import StringIO
from datetime import datetime

def export_responses_json(
    responses: list,
    survey_config: dict,
    anonymize: bool = False,
) -> str:
    """Export responses as JSON string"""
    data = []
    for idx, response in enumerate(responses):
        item = {
            "response_id": str(response.id),
            "answers": response.answers,
            "is_draft": response.is_draft,
            "submitted_at": response.submitted_at.isoformat() if response.submitted_at else None,
            "updated_at": response.updated_at.isoformat(),
        }

        if anonymize:
            item["respondent"] = f"respondent_{idx + 1}"
        else:
            item["github_username"] = response.user.github_username
            item["email"] = response.user.email

        data.append(item)

    return json.dumps(data, indent=2)

def export_responses_csv(
    responses: list,
    survey_config: dict,
    anonymize: bool = False,
) -> str:
    """Export responses as flattened CSV string"""
    output = StringIO()

    # Build header from survey config
    headers = ["response_id"]
    if anonymize:
        headers.append("respondent")
    else:
        headers.extend(["github_username", "email"])
    headers.extend(["is_draft", "submitted_at", "updated_at"])

    # Add question columns
    question_ids = []
    for vector in survey_config.get("vectors", []):
        for question in vector.get("questions", []):
            qid = question["question_id"]
            question_ids.append(qid)
            headers.append(qid)

    writer = csv.writer(output)
    writer.writerow(headers)

    # Write data rows
    for idx, response in enumerate(responses):
        row = [str(response.id)]

        if anonymize:
            row.append(f"respondent_{idx + 1}")
        else:
            row.append(response.user.github_username)
            row.append(response.user.email or "")

        row.append("draft" if response.is_draft else "submitted")
        row.append(response.submitted_at.isoformat() if response.submitted_at else "")
        row.append(response.updated_at.isoformat())

        # Add answers
        for qid in question_ids:
            answer = response.answers.get(qid, "")
            # Flatten complex answers
            if isinstance(answer, list):
                answer = "; ".join(str(a) for a in answer)
            elif isinstance(answer, dict):
                answer = json.dumps(answer)
            row.append(answer)

        writer.writerow(row)

    return output.getvalue()
```

### 4.4 Responses Router (Admin)

**File**: `app/routers/surveys.py` (extend)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/surveys/{survey_id}/responses` | GET | Admin | List responses with pagination |
| `/surveys/{survey_id}/export` | GET | Admin | Export responses as JSON or CSV |

```python
from typing import Literal
from fastapi import Query
from fastapi.responses import Response as FastAPIResponse

@router.get("/{survey_id}/responses", response_model=ResponseListResponse)
async def list_survey_responses(
    survey_id: UUID,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None, min_length=1, description="Search by username or email"),
    status: Literal['completed', 'draft', 'all'] | None = Query(None, description="Filter by response status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all responses for a survey with pagination, search, and status filter"""
    survey = await get_survey_by_id(db, survey_id)
    if not survey or survey.deleted_at:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    responses, total = await get_survey_responses(
        db, survey_id, limit, offset, search, status
    )
    return {
        "items": responses,
        "total": total,
        "limit": limit,
        "offset": offset,
    }

@router.get("/{survey_id}/export")
async def export_survey_responses(
    survey_id: UUID,
    format: str = Query("json", regex="^(json|csv)$"),
    anonymize: bool = Query(False),
    from_date: datetime | None = Query(None),
    to_date: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Export survey responses as JSON or CSV"""
    survey = await get_survey_by_id(db, survey_id)
    if not survey or survey.deleted_at:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    responses = await get_all_responses_for_export(
        db, survey_id, from_date, to_date
    )

    if format == "json":
        content = export_responses_json(responses, survey.config, anonymize)
        media_type = "application/json"
        filename = f"{survey.slug}-responses.json"
    else:
        content = export_responses_csv(responses, survey.config, anonymize)
        media_type = "text/csv"
        filename = f"{survey.slug}-responses.csv"

    return FastAPIResponse(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

## Acceptance Criteria

- [ ] `GET /api/v1/surveys/{id}/responses` returns paginated response list
- [ ] Response list includes user info (username, email, avatar)
- [ ] Pagination parameters work correctly (page, page_size)
- [ ] `GET /api/v1/surveys/{id}/export?format=json` returns JSON file
- [ ] `GET /api/v1/surveys/{id}/export?format=csv` returns CSV file
- [ ] CSV export flattens nested answers correctly
- [ ] `anonymize=true` replaces usernames with respondent_N
- [ ] Date filters work correctly (from_date, to_date)
- [ ] Export endpoints return proper Content-Disposition header
- [ ] All endpoints validate survey ownership

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Security-First | Admin auth, ownership validation, anonymization option |
| II. Type Safety | Pydantic schemas for all responses |
| III. Async-First | Async database queries with pagination |
| IV. Testing | Test export formats and filters |
| V. Code Quality | Export service separated from routes |
| VI. RESTful API | Query params for filtering, proper content types |

## Testing Checklist

- [ ] Response list returns correct page
- [ ] Response list includes user info via join
- [ ] JSON export contains all responses
- [ ] CSV export flattens multi_checkbox to semicolon-separated
- [ ] CSV export flattens single_choice_with_text to JSON
- [ ] Anonymization replaces identifying info
- [ ] Date filters exclude out-of-range responses
- [ ] Export returns correct Content-Type header

## Files Created/Modified

```
backend/
├── app/
│   ├── routers/
│   │   └── surveys.py (extended)
│   ├── schemas/
│   │   └── response.py (extended)
│   └── services/
│       ├── response.py (extended)
│       └── export.py (new)
└── tests/
    └── test_export.py (new)
```

## Completion

This stage completes the backend API. All endpoints from the API contract are now implemented.

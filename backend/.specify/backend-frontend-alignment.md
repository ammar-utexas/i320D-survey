# Backend Changes Required for Frontend Support

**Created**: 2026-01-18
**Purpose**: Document backend modifications needed to fully support all frontend delivery stages
**Status**: Action Required

---

## Summary

This document identifies gaps between the current backend specification and the frontend delivery stages. Each section describes the required change, affected frontend stage, and implementation details.

---

## Required Changes

### 1. Add `is_draft` Field to Response Model

**Priority**: P0 (Blocks Stage 3)
**Affected Stage**: Stage 3 - Survey Response Features

#### Problem

Frontend Stage 3 requires distinguishing between auto-saved drafts and final submissions:
- "Save Draft" button saves without marking complete
- "Submit Survey" button marks response as final
- UI shows "Update Response" for submitted responses

The current backend Response model lacks this capability.

#### Solution

**Update Response Model** (`app/models/response.py`):

```python
class Response(Base):
    __tablename__ = "responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    survey_id = Column(UUID(as_uuid=True), ForeignKey("surveys.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    answers = Column(JSON, nullable=False)
    is_draft = Column(Boolean, default=True, nullable=False)  # NEW FIELD
    submitted_at = Column(DateTime)  # Set when is_draft becomes False
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**Update Response Schema** (`app/schemas/response.py`):

```python
class ResponseCreate(BaseModel):
    answers: dict
    is_draft: bool = True  # Default to draft for auto-save

class ResponseResponse(BaseModel):
    id: UUID
    survey_id: UUID
    user_id: UUID
    answers: dict
    is_draft: bool
    submitted_at: datetime | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

**Update Respond Endpoint** (`app/routers/responses.py`):

```python
@router.post("/surveys/{slug}/respond")
async def submit_response(
    slug: str,
    response_data: ResponseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Upsert logic
    existing = await get_user_response(db, slug, current_user.id)

    if existing:
        existing.answers = response_data.answers
        existing.is_draft = response_data.is_draft
        if not response_data.is_draft and existing.submitted_at is None:
            existing.submitted_at = datetime.utcnow()
    else:
        # Create new response
        new_response = Response(
            answers=response_data.answers,
            is_draft=response_data.is_draft,
            submitted_at=None if response_data.is_draft else datetime.utcnow(),
            ...
        )

    return response
```

**Migration Required**: Yes - add `is_draft` column with default `True`

---

### 2. Add `response_count` to Survey List/Detail Endpoints

**Priority**: P0 (Blocks Stage 4)
**Affected Stage**: Stage 4 - Admin Dashboard Core

#### Problem

Frontend Stage 4 SurveyCard component displays response count:
```
24/30 responses · Closes Jan 25, 2026
```

The backend `GET /surveys` endpoint doesn't return response counts.

#### Solution

**Option A: Computed Field in Response** (Recommended)

**Update Survey Schema** (`app/schemas/survey.py`):

```python
class SurveyListResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str | None
    opens_at: datetime | None
    closes_at: datetime | None
    created_at: datetime
    response_count: int  # NEW FIELD
    completed_count: int  # NEW FIELD (is_draft=False)

    model_config = ConfigDict(from_attributes=True)
```

**Update List Endpoint** (`app/routers/surveys.py`):

```python
@router.get("/", response_model=list[SurveyListResponse])
async def list_surveys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Query with response count
    query = (
        select(
            Survey,
            func.count(Response.id).label("response_count"),
            func.count(Response.id).filter(Response.is_draft == False).label("completed_count")
        )
        .outerjoin(Response, Survey.id == Response.survey_id)
        .where(Survey.created_by == current_user.id)
        .where(Survey.deleted_at.is_(None))
        .group_by(Survey.id)
    )

    results = await db.execute(query)
    # Map to response model with counts
```

**Option B: Separate Endpoint**

Add `GET /surveys/{id}/stats` returning:
```json
{
  "response_count": 24,
  "completed_count": 20,
  "draft_count": 4
}
```

Frontend would need additional API call per survey (less efficient).

---

### 3. Add Search Filter to Responses Endpoint

**Priority**: P1 (Blocks Stage 5)
**Affected Stage**: Stage 5 - Admin Advanced Features

#### Problem

Frontend Stage 5 ResponseTable has search functionality:
```jsx
<SearchInput
  placeholder="Search by username..."
  onSearch={(query) => fetchResponses({ search: query })}
/>
```

Backend `GET /surveys/{id}/responses` only supports pagination.

#### Solution

**Update Responses Endpoint** (`app/routers/surveys.py`):

```python
@router.get("/{survey_id}/responses", response_model=PaginatedResponses)
async def list_responses(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None, min_length=1),  # NEW PARAM
    status: str | None = Query(None, regex="^(completed|draft|all)$"),  # NEW PARAM
):
    query = (
        select(Response, User)
        .join(User, Response.user_id == User.id)
        .where(Response.survey_id == survey_id)
    )

    # Apply search filter
    if search:
        query = query.where(
            or_(
                User.github_username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )

    # Apply status filter
    if status == "completed":
        query = query.where(Response.is_draft == False)
    elif status == "draft":
        query = query.where(Response.is_draft == True)

    # Pagination
    query = query.offset(offset).limit(limit)

    results = await db.execute(query)
    # ...
```

**Update Response Schema** (`app/schemas/response.py`):

```python
class ResponseWithUser(BaseModel):
    id: UUID
    answers: dict
    is_draft: bool
    submitted_at: datetime | None
    updated_at: datetime
    user: UserBasic  # Nested user info

class UserBasic(BaseModel):
    id: UUID
    github_username: str
    email: str | None
    avatar_url: str | None

class PaginatedResponses(BaseModel):
    items: list[ResponseWithUser]
    total: int
    limit: int
    offset: int
```

---

### 4. Update Root CLAUDE.md Response Model

**Priority**: P1 (Documentation sync)
**Affected**: All stages

#### Problem

Root `CLAUDE.md` shows `is_draft` field but backend PRD doesn't include it, causing confusion.

#### Solution

Ensure all three documents are synchronized:
- `/CLAUDE.md` (root)
- `/backend/PRD.md`
- `/backend/CLAUDE.md`

Response model should consistently show:

```json
{
  "id": "uuid",
  "survey_id": "uuid",
  "user_id": "uuid",
  "answers": "jsonb",
  "is_draft": "boolean (true=auto-saved, false=submitted)",
  "submitted_at": "timestamp (nullable, set when is_draft becomes false)",
  "updated_at": "timestamp"
}
```

---

### 5. Clarify Export Query Parameters

**Priority**: P2 (Stage 5 enhancement)
**Affected Stage**: Stage 5 - Admin Advanced Features

#### Problem

Frontend Stage 5 ExportOptions component sends:
```js
export(surveyId, format, {
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  anonymize: true
})
```

Backend PRD mentions these features but doesn't specify exact parameter names.

#### Solution

**Document Export Endpoint Parameters**:

```
GET /surveys/{id}/export?format=json|csv&from_date=YYYY-MM-DD&to_date=YYYY-MM-DD&anonymize=true|false
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `json` or `csv` |
| `from_date` | date | No | Filter responses from this date |
| `to_date` | date | No | Filter responses until this date |
| `anonymize` | boolean | No | Replace usernames with `respondent_N` |

**Update Frontend API** to use these exact parameter names.

---

### 6. Frontend API Missing `is_draft` Parameter

**Priority**: P0 (Blocks Stage 3)
**Affected Stage**: Stage 2, Stage 3 - Frontend code

#### Problem

Frontend stage documents show API calls without the `is_draft` parameter:

**Stage 2** (`src/api/surveys.js`):
```js
respond: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
  method: 'POST',
  body: { answers },  // Missing is_draft
}),
```

**Stage 3** (`src/api/responses.js`):
```js
submit: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
  method: 'POST',
  body: { answers },  // Missing is_draft
}),
```

#### Solution

**Update Frontend API** to include `is_draft`:

```js
// Stage 2 - Basic submission (always final)
respond: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
  method: 'POST',
  body: { answers, is_draft: false },
}),

// Stage 3 - Auto-save (draft) vs Submit (final)
save: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
  method: 'POST',
  body: { answers, is_draft: true },
}),

submit: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
  method: 'POST',
  body: { answers, is_draft: false },
}),
```

---

### 7. Export Parameter Name Mismatch

**Priority**: P1 (Stage 5)
**Affected Stage**: Stage 5 - Admin Advanced Features

#### Problem

Frontend uses camelCase, backend uses snake_case:

| Frontend | Backend |
|----------|---------|
| `startDate` | `from_date` |
| `endDate` | `to_date` |

#### Solution

**Update Frontend Stage 5** to use backend parameter names:

```js
// Before
options: { startDate, endDate, anonymize }

// After
options: { from_date, to_date, anonymize }
```

Or transform in the API call:
```js
export: async (id, format, options = {}) => {
  const params = new URLSearchParams({
    format,
    ...(options.startDate && { from_date: options.startDate }),
    ...(options.endDate && { to_date: options.endDate }),
    ...(options.anonymize && { anonymize: options.anonymize }),
  });
  // ...
}
```

---

### 8. Duplicate Endpoint Missing from Frontend API

**Priority**: P1 (Stage 5)
**Affected Stage**: Stage 5 - Admin Advanced Features

#### Problem

Stage 5 notes uncertainty about duplicate endpoint:
> "Note: Backend may need a duplicate endpoint, or frontend fetches config and re-creates."

Backend PRD (BE-ADMIN-08) already defines:
> `POST /surveys/{id}/duplicate` - Clone config with new slug/title

Frontend API module doesn't include this endpoint.

#### Solution

**Add to Frontend API** (`src/api/surveys.js`):

```js
export const surveysApi = {
  // ... existing methods

  // Duplicate survey
  duplicate: (id, newTitle) => apiRequest(`/surveys/${id}/duplicate`, {
    method: 'POST',
    body: { title: newTitle },
  }),
};
```

**Update Stage 5** to use this endpoint instead of manual fetch-and-recreate.

---

## Migration Checklist

### Database Migrations

- [ ] Add `is_draft` column to `responses` table (default: `true`)
- [ ] Backfill existing responses: set `is_draft = false` where `submitted_at` is not null

```python
# alembic/versions/xxx_add_is_draft_to_responses.py
def upgrade():
    op.add_column('responses', sa.Column('is_draft', sa.Boolean(), nullable=False, server_default='true'))

    # Backfill: existing responses with submitted_at are not drafts
    op.execute("""
        UPDATE responses
        SET is_draft = false
        WHERE submitted_at IS NOT NULL
    """)

def downgrade():
    op.drop_column('responses', 'is_draft')
```

### Code Changes (Backend)

- [ ] `app/models/response.py` - Add `is_draft` field
- [ ] `app/schemas/response.py` - Add `is_draft` to schemas, add `ResponseWithUser`
- [ ] `app/schemas/survey.py` - Add `response_count`, `completed_count` to list schema
- [ ] `app/routers/surveys.py` - Update list query with counts
- [ ] `app/routers/responses.py` - Add `search`, `status` query params
- [ ] `app/routers/surveys.py` (export) - Document query params

### Code Changes (Frontend Stages)

- [ ] `frontend/.specify/delivery/stage-2-question-components.md` - Add `is_draft: false` to respond API
- [ ] `frontend/.specify/delivery/stage-3-response-features.md` - Split into `save` (draft) and `submit` (final) API calls
- [ ] `frontend/.specify/delivery/stage-5-admin-advanced.md` - Fix export param names, add duplicate endpoint

### Documentation Updates

- [ ] `/CLAUDE.md` - Ensure Response model matches
- [ ] `/backend/PRD.md` - Add `is_draft` field, document search param
- [ ] `/backend/CLAUDE.md` - Update schema examples

---

## API Contract Summary

After implementing these changes, the API contract will be:

### Response Endpoints

```
POST /surveys/{slug}/respond
Body: { answers: {}, is_draft: boolean }
Returns: ResponseResponse with is_draft status

GET /surveys/{slug}/my-response
Returns: ResponseResponse with is_draft status
```

### Admin Endpoints

```
GET /surveys
Returns: [{ ..., response_count: int, completed_count: int }]

GET /surveys/{id}/responses?limit=20&offset=0&search=username&status=completed
Returns: { items: [ResponseWithUser], total: int, limit: int, offset: int }

GET /surveys/{id}/export?format=csv&from_date=2026-01-01&to_date=2026-01-31&anonymize=true
Returns: File download
```

---

## Implementation Order

1. **Phase 1** (Unblocks Stage 3 & 4):
   - Add `is_draft` field and migration (Backend)
   - Add `response_count` to survey list (Backend)
   - Update Stage 2 & 3 API calls with `is_draft` (Frontend)

2. **Phase 2** (Unblocks Stage 5):
   - Add search/status filters to responses endpoint (Backend)
   - Document export parameters (Backend)
   - Fix export param names in Stage 5 (Frontend)
   - Add duplicate endpoint to Stage 5 API (Frontend)

3. **Phase 3** (Cleanup):
   - Sync all documentation
   - Update tests

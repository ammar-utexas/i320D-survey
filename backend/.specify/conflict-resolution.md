# Frontend-Backend Conflict Resolution

**Created**: 2026-01-18
**Purpose**: Comprehensive list of conflicts between frontend and backend delivery stages
**Status**: Needs Resolution

---

## Critical Conflicts (Blocks Integration)

### C1: Response Submit Schema Missing `is_draft`

**Severity**: Critical
**Blocks**: Frontend Stage 2-3

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `POST /surveys/{slug}/respond` | `POST /surveys/{slug}/respond` |
| Body: `{ answers: {}, is_draft: boolean }` | Body: `{ answers: {} }` |

**Frontend Code** (stage-2, line 181-184):
```js
respond: (slug, answers, isDraft = false) => apiRequest(`/surveys/${slug}/respond`, {
  method: 'POST',
  body: { answers, is_draft: isDraft },
}),
```

**Backend Schema** (stage-2, line 99-101):
```python
class ResponseSubmit(BaseModel):
    answers: dict  # Missing is_draft!
```

**Resolution**: Update `ResponseSubmit` schema to include `is_draft: bool = True`

---

### C2: Response List Missing Search Filter

**Severity**: Critical
**Blocks**: Frontend Stage 5

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `GET /surveys/{id}/responses?search=username` | `GET /surveys/{id}/responses?page=1&page_size=20` |

**Frontend Code** (stage-5, line 237-240):
```js
getResponses: (id, params) => {
  // params: { limit, offset, search, status }
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/surveys/${id}/responses?${query}`);
},
```

**Backend Route** (stage-4, line 237-243):
```python
async def list_survey_responses(
    survey_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    # Missing: search, status
)
```

**Resolution**: Add `search: str | None` and `status: str | None` query params to backend

---

### C3: Pagination Parameter Naming Mismatch

**Severity**: High
**Blocks**: Frontend Stage 5

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `limit`, `offset` | `page`, `page_size` |

**Frontend Code** (stage-5, line 237-240):
```js
// params: { limit, offset, search, status }
```

**Backend Route** (stage-4):
```python
page: int = Query(1, ge=1),
page_size: int = Query(20, ge=1, le=100),
```

**Resolution Options**:
1. **Option A**: Backend changes to `limit`/`offset` (common REST pattern)
2. **Option B**: Frontend changes to `page`/`page_size` (simpler math)
3. **Option C**: Backend accepts both and converts internally

**Recommended**: Option A - Backend uses `limit`/`offset` as it's more RESTful

---

## High Priority Conflicts

### C4: Response Status Filter Missing

**Severity**: High
**Blocks**: Frontend Stage 5 filtering

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `?status=completed\|draft\|all` | No status filter |

**Frontend Code** (stage-5, line 20-23):
```
Status values derived from is_draft field:
- Completed: is_draft: false
- In Progress: is_draft: true
```

**Resolution**: Add `status: Literal['completed', 'draft', 'all'] | None` query param

---

### C5: Survey List Missing `completed_count`

**Severity**: Medium
**Affects**: Frontend Stage 4 dashboard stats

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `response_count`, `completed_count` | `response_count`, `is_open` |

**Alignment Doc** (line 131):
```python
completed_count: int  # NEW FIELD (is_draft=False)
```

**Backend Stage 3** SurveyListItem:
```python
response_count: int
is_open: bool  # Computed: within open/close window
# Missing: completed_count
```

**Resolution**: Add `completed_count` to SurveyListItem schema and query

---

### C6: Upsert Logic Not Handling `is_draft` Transition

**Severity**: High
**Affects**: Submit vs Draft behavior

**Frontend Behavior** (stage-3, line 187-198):
```js
// Auto-save as draft (is_draft: true)
saveDraft: (slug, answers) => ...body: { answers, is_draft: true }

// Final submission (is_draft: false)
submit: (slug, answers) => ...body: { answers, is_draft: false }
```

**Backend upsert** (stage-2, line 158-176) doesn't handle:
1. Setting `is_draft` from request body
2. Setting `submitted_at` when `is_draft` changes from `true` to `false`
3. Preventing re-submission (is_draft back to true after submit?)

**Resolution**: Update upsert logic per alignment doc section 1

---

## Medium Priority Conflicts

### C7: Response Data Schema Inconsistency

**Severity**: Medium
**Affects**: Frontend response handling

**Frontend expects** (stage-3, line 201-204):
```js
// Response includes:
// - is_draft: boolean
// - submitted_at: timestamp | null
// - updated_at: timestamp
```

**Backend ResponseData** (stage-2, line 103-110):
```python
class ResponseData(BaseModel):
    answers: dict
    is_draft: bool  # ✓ Present
    submitted_at: datetime | None  # ✓ Present
    updated_at: datetime  # ✓ Present
```

**Status**: ✓ Aligned (no conflict)

---

### C8: Export Date Parameter Names

**Severity**: Low
**Affects**: Frontend Stage 5 export

| Frontend Uses | Backend Uses |
|---------------|--------------|
| `from_date`, `to_date` | `from_date`, `to_date` |

**Status**: ✓ Aligned (noted in frontend stage-5 line 103-107)

---

### C9: Duplicate Endpoint Request Body

**Severity**: Low
**Affects**: Frontend Stage 5 duplicate feature

**Frontend Code** (stage-5, line 155-159):
```js
duplicate: (id, newTitle) => apiRequest(`/surveys/${id}/duplicate`, {
  method: 'POST',
  body: { title: newTitle },
}),
```

**Backend Service** (stage-3, line 161-177):
```python
async def duplicate_survey(
    survey: Survey,
    user_id: UUID,
    new_title: str | None = None,  # Optional
)
```

**Status**: ✓ Aligned - Backend accepts optional title

---

## Conflicts Already Resolved

### R1: `is_draft` Field in Response Model

**Status**: ✓ Resolved in Backend Stage 2
- Response model includes `is_draft: bool = True`
- Uses `deleted_at` for soft delete (not `is_deleted`)

### R2: `response_count` in Survey List

**Status**: ✓ Resolved in Backend Stage 3
- `SurveyListItem` includes `response_count: int`

### R3: Soft Delete Field Naming

**Status**: ✓ Aligned
- Both use `deleted_at: DateTime | None` pattern

---

## Resolution Summary

| ID | Conflict | Resolution | Owner | Priority |
|----|----------|------------|-------|----------|
| C1 | ResponseSubmit missing is_draft | Add `is_draft: bool = True` to schema | Backend | P0 |
| C2 | Missing search filter | Add `search` query param | Backend | P0 |
| C3 | Pagination naming | Use `limit`/`offset` in backend | Backend | P0 |
| C4 | Missing status filter | Add `status` query param | Backend | P1 |
| C5 | Missing completed_count | Add to SurveyListItem + query | Backend | P1 |
| C6 | Upsert is_draft logic | Implement draft→submit transition | Backend | P0 |

---

## Implementation Order

### Phase 1: Unblock Stage 2-3 Integration
1. **C1**: Add `is_draft` to ResponseSubmit schema
2. **C6**: Update upsert to handle is_draft and submitted_at

### Phase 2: Unblock Stage 4 Integration
3. **C5**: Add `completed_count` to survey list response

### Phase 3: Unblock Stage 5 Integration
4. **C3**: Change pagination to `limit`/`offset`
5. **C2**: Add `search` query parameter
6. **C4**: Add `status` query parameter

---

## Updated API Contract

After resolving all conflicts:

### Response Endpoints

```
POST /surveys/{slug}/respond
Body: { answers: {}, is_draft: boolean }
Returns: { answers, is_draft, submitted_at, updated_at }

GET /surveys/{slug}/my-response
Returns: { answers, is_draft, submitted_at, updated_at } | null
```

### Admin List Endpoints

```
GET /surveys
Returns: [{ id, slug, title, response_count, completed_count, is_open, ... }]

GET /surveys/{id}/responses?limit=20&offset=0&search=username&status=completed
Returns: { items: [...], total, limit, offset }
```

### Export Endpoint

```
GET /surveys/{id}/export?format=json&from_date=YYYY-MM-DD&to_date=YYYY-MM-DD&anonymize=true
Returns: File download
```

# Frontend-Backend Conflict Resolution

**Created**: 2026-01-18
**Updated**: 2026-01-18
**Purpose**: Comprehensive list of conflicts between frontend and backend delivery stages
**Status**: ✅ All Conflicts Resolved

---

## Critical Conflicts (Blocks Integration)

### C1: Response Submit Schema Missing `is_draft`

**Severity**: Critical
**Blocks**: Frontend Stage 2-3
**Status**: ✅ RESOLVED

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `POST /surveys/{slug}/respond` | `POST /surveys/{slug}/respond` |
| Body: `{ answers: {}, is_draft: boolean }` | Body: `{ answers: {}, is_draft: boolean }` ✅ |

**Resolution Applied**: Backend stage-2 `ResponseSubmit` schema now includes `is_draft: bool = True` (lines 99-102)

---

### C2: Response List Missing Search Filter

**Severity**: Critical
**Blocks**: Frontend Stage 5
**Status**: ✅ RESOLVED

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `GET /surveys/{id}/responses?search=username` | `GET /surveys/{id}/responses?search=username` ✅ |

**Resolution Applied**: Backend stage-4 now includes `search: str | None` query parameter (line 266)

---

### C3: Pagination Parameter Naming Mismatch

**Severity**: High
**Blocks**: Frontend Stage 5
**Status**: ✅ RESOLVED

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `limit`, `offset` | `limit`, `offset` ✅ |

**Resolution Applied**: Backend stage-4 uses `limit`/`offset` (lines 264-265) matching frontend expectations

---

## High Priority Conflicts

### C4: Response Status Filter Missing

**Severity**: High
**Blocks**: Frontend Stage 5 filtering
**Status**: ✅ RESOLVED

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `?status=completed\|draft\|all` | `?status=completed\|draft\|all` ✅ |

**Resolution Applied**: Backend stage-4 includes `status: Literal['completed', 'draft', 'all'] | None` query parameter (line 267)

---

### C5: Survey List Missing `completed_count`

**Severity**: Medium
**Affects**: Frontend Stage 4 dashboard stats
**Status**: ✅ RESOLVED

| Frontend Expects | Backend Provides |
|------------------|------------------|
| `response_count`, `completed_count` | `response_count`, `completed_count`, `is_open` ✅ |

**Resolution Applied**: Backend stage-3 `SurveyListItem` schema includes both `response_count: int` and `completed_count: int` (lines 70-72)

---

### C6: Upsert Logic Not Handling `is_draft` Transition

**Severity**: High
**Affects**: Submit vs Draft behavior
**Status**: ✅ RESOLVED

**Frontend Behavior** (stage-3, lines 187-198):
- `saveDraft`: sends `is_draft: true`
- `submit`: sends `is_draft: false`

**Resolution Applied**: Backend stage-2 `upsert_response` function (lines 159-195) now:
1. ✅ Sets `is_draft` from request body (line 173)
2. ✅ Sets `submitted_at` when transitioning from draft to submitted (lines 176-178)
3. ✅ Handles new responses with correct `is_draft` and `submitted_at` (lines 185-191)

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

| ID | Conflict | Resolution | Status |
|----|----------|------------|--------|
| C1 | ResponseSubmit missing is_draft | Added `is_draft: bool = True` to schema | ✅ Done |
| C2 | Missing search filter | Added `search` query param | ✅ Done |
| C3 | Pagination naming | Using `limit`/`offset` in backend | ✅ Done |
| C4 | Missing status filter | Added `status` query param | ✅ Done |
| C5 | Missing completed_count | Added to SurveyListItem + query | ✅ Done |
| C6 | Upsert is_draft logic | Implemented draft→submit transition | ✅ Done |

---

## Implementation Order

All phases have been completed in the delivery stage documents.

### Phase 1: Unblock Stage 2-3 Integration ✅
1. **C1**: ✅ `is_draft` added to ResponseSubmit schema (backend stage-2)
2. **C6**: ✅ Upsert handles is_draft and submitted_at (backend stage-2)

### Phase 2: Unblock Stage 4 Integration ✅
3. **C5**: ✅ `completed_count` added to survey list response (backend stage-3)

### Phase 3: Unblock Stage 5 Integration ✅
4. **C3**: ✅ Pagination uses `limit`/`offset` (backend stage-4)
5. **C2**: ✅ `search` query parameter added (backend stage-4)
6. **C4**: ✅ `status` query parameter added (backend stage-4)

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

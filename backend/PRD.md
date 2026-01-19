# Backend Product Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| Product Name | SurveyFlow Backend |
| Version | 1.0 |
| Parent Document | ../survey_platform_prd.md |
| Date | January 2026 |
| Status | Draft |

---

## 1. Overview

The SurveyFlow backend is a FastAPI application that provides REST API endpoints for authentication, survey management, response collection, and data export. It uses PostgreSQL for data persistence and integrates with GitHub OAuth for user authentication.

---

## 2. Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Database | PostgreSQL |
| Auth | Authlib (GitHub OAuth), python-jose (JWT) |
| Validation | Pydantic v2 |
| Hosting | Railway |

---

## 3. Requirements

### 3.1 Authentication (BE-AUTH)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| BE-AUTH-01 | P0 | Implement GitHub OAuth 2.0 flow | - GET /auth/github redirects to GitHub authorization<br>- GET /auth/github/callback exchanges code for token<br>- Successful auth redirects to frontend with session |
| BE-AUTH-02 | P0 | Fetch and store user profile from GitHub API | - Create User record on first login<br>- Update User record on subsequent logins<br>- Store: github_id, github_username, email, avatar_url |
| BE-AUTH-03 | P1 | JWT session management with 24-hour expiry | - Generate JWT containing user_id on successful OAuth<br>- Set HTTP-only, secure cookie<br>- Validate JWT on all protected endpoints<br>- Return 401 when token expired/invalid |
| BE-AUTH-04 | P1 | Logout endpoint | - POST /auth/logout clears session cookie<br>- Return 200 on success |
| BE-AUTH-05 | P2 | Restrict login to specific GitHub organizations | - Check org membership via GitHub API<br>- Configurable via ALLOWED_GITHUB_ORGS env var<br>- Return 403 with clear message if not in allowed org |

### 3.2 Survey Management (BE-ADMIN)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| BE-ADMIN-01 | P0 | Create survey from JSON config | - POST /surveys accepts JSON body<br>- Store config in JSONB column<br>- Associate with authenticated user<br>- Return created survey with ID and slug |
| BE-ADMIN-02 | P0 | Validate JSON schema on upload | - Validate against survey JSON schema<br>- Return 422 with structured errors on failure<br>- Include field path and error message |
| BE-ADMIN-03 | P0 | Generate unique shareable survey URL | - Generate URL-safe slug from title<br>- Ensure uniqueness (append number if needed)<br>- Return full URL in response |
| BE-ADMIN-04 | P1 | Store and enforce survey open/close dates | - Accept opens_at, closes_at in create/update<br>- Return 403 for responses outside date range<br>- Include is_open boolean in survey response |
| BE-ADMIN-05 | P1 | List respondents with completion status | - GET /surveys/{id}/responses returns list<br>- Include: user info, is_draft, submitted_at<br>- Support pagination (limit, offset)<br>- Support search by username/email<br>- Support status filter (completed, draft, all) |
| BE-ADMIN-06 | P1 | Export responses as JSON or CSV | - GET /surveys/{id}/export?format=json\|csv<br>- JSON: array of full response objects<br>- CSV: flattened with one row per respondent<br>- Set appropriate Content-Type and Content-Disposition |
| BE-ADMIN-07 | P2 | Update survey metadata | - PATCH /surveys/{id} accepts title, description<br>- Do not allow config changes<br>- Return updated survey |
| BE-ADMIN-08 | P2 | Duplicate survey | - POST /surveys/{id}/duplicate<br>- Clone config with new slug/title<br>- Clear dates, set new created_by |
| BE-ADMIN-09 | P2 | Soft delete survey | - DELETE /surveys/{id} sets deleted_at<br>- Exclude deleted from list queries<br>- Return 404 for deleted surveys |

### 3.3 Survey Response (BE-RESP)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| BE-RESP-01 | P0 | Serve survey config for rendering | - GET /surveys/{slug}/public returns config<br>- No auth required for survey metadata<br>- Include title, description, vectors, questions |
| BE-RESP-02 | P0 | N/A - Config structure defines vectors | - Serve config as-is from database |
| BE-RESP-03 | P0 | Server-side validation on submission | - POST /surveys/{slug}/respond validates all answers<br>- Check required fields<br>- Return 422 with field-level errors |
| BE-RESP-04 | P1 | Upsert responses (create or update) | - POST creates new or updates existing<br>- Accept `is_draft` parameter (true=auto-save, false=submit)<br>- Set submitted_at when is_draft transitions to false<br>- Return updated response with timestamps |
| BE-RESP-05 | P1 | Return user's existing response | - GET /surveys/{slug}/my-response<br>- Return null if no response exists (not 404)<br>- Check closes_at before accepting updates |
| BE-RESP-06 | P1 | N/A - Frontend only | - |
| BE-RESP-07 | P2 | N/A - Frontend only | - |
| BE-RESP-08 | P2 | N/A - Frontend only | - |

### 3.4 Question Type Validation (BE-QTYPE)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| BE-QTYPE-01 | P0 | Validate scale_1_5 answers | - Answer must be integer 1-5<br>- Return error if out of range |
| BE-QTYPE-02 | P0 | Validate single_choice answers | - Answer must be string from options array<br>- Return error if not in options |
| BE-QTYPE-03 | P0 | Validate multi_checkbox answers | - Answer must be array of strings<br>- Each item must be in options array |
| BE-QTYPE-04 | P0 | Validate dropdown answers | - Answer must be string from options array |
| BE-QTYPE-05 | P0 | Validate single_choice_with_text answers | - Answer must be object with choice and text<br>- choice must be from options<br>- text is optional string |
| BE-QTYPE-06 | P0 | Validate open_text answers | - Answer must be string<br>- Max 1000 characters |

### 3.5 Data Export (BE-EXPORT)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| BE-EXPORT-01 | P0 | Generate JSON export | - Return JSON array of response objects<br>- Include full answer structure<br>- Set Content-Type: application/json |
| BE-EXPORT-02 | P0 | Generate flattened CSV | - One row per respondent<br>- Flatten nested answers to columns<br>- Handle arrays (join with semicolon)<br>- Include header row |
| BE-EXPORT-03 | P1 | Include respondent metadata | - Add columns: github_username, email, submitted_at, updated_at |
| BE-EXPORT-04 | P2 | Filter by date range | - Accept from_date, to_date query params<br>- Filter responses by submitted_at |
| BE-EXPORT-05 | P2 | Anonymized export | - Accept anonymize=true query param<br>- Replace github_username with respondent_N<br>- Remove email field |

---

## 4. API Endpoints

### 4.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/auth/github` | No | Initiate GitHub OAuth flow |
| GET | `/api/v1/auth/github/callback` | No | Handle OAuth callback |
| POST | `/api/v1/auth/logout` | Yes | Clear session |
| GET | `/api/v1/auth/me` | Yes | Get current user |

### 4.2 Surveys (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/surveys` | Yes (Admin) | Create survey |
| GET | `/api/v1/surveys` | Yes (Admin) | List admin's surveys |
| GET | `/api/v1/surveys/{id}` | Yes (Admin) | Get survey details |
| PATCH | `/api/v1/surveys/{id}` | Yes (Admin) | Update metadata |
| DELETE | `/api/v1/surveys/{id}` | Yes (Admin) | Soft delete |
| POST | `/api/v1/surveys/{id}/duplicate` | Yes (Admin) | Duplicate survey |
| GET | `/api/v1/surveys/{id}/responses` | Yes (Admin) | List responses |
| GET | `/api/v1/surveys/{id}/export` | Yes (Admin) | Export responses |

### 4.3 Responses (Respondent)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/surveys/{slug}/public` | No | Get survey for rendering |
| POST | `/api/v1/surveys/{slug}/respond` | Yes | Submit/update response |
| GET | `/api/v1/surveys/{slug}/my-response` | Yes | Get user's response |

### 4.4 Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | No | Health check |

---

## 5. Data Models

### 5.1 User

```python
class User(Base):
    __tablename__ = "users"

    id: UUID (PK)
    github_id: Integer (unique, indexed)
    github_username: String
    email: String
    avatar_url: String
    is_admin: Boolean (default: False)
    created_at: DateTime
    last_login_at: DateTime
```

### 5.2 Survey

```python
class Survey(Base):
    __tablename__ = "surveys"

    id: UUID (PK)
    slug: String (unique, indexed)
    title: String
    description: String (nullable)
    config: JSONB
    created_by: UUID (FK -> users.id)
    opens_at: DateTime (nullable)
    closes_at: DateTime (nullable)
    deleted_at: DateTime (nullable)
    created_at: DateTime
    updated_at: DateTime
```

### 5.3 Response

```python
class Response(Base):
    __tablename__ = "responses"

    id: UUID (PK)
    survey_id: UUID (FK -> surveys.id)
    user_id: UUID (FK -> users.id)
    answers: JSONB
    is_draft: Boolean (default: True)  # True=auto-saved, False=submitted
    submitted_at: DateTime (nullable)  # Set when is_draft becomes False
    created_at: DateTime
    updated_at: DateTime

    # Unique constraint on (survey_id, user_id)
```

---

## 6. Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message",
  "errors": [
    {
      "field": "answers.Q1",
      "message": "Value must be between 1 and 5"
    }
  ]
}
```

| Status | Usage |
|--------|-------|
| 400 | Bad request (malformed JSON) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner, survey closed, org restriction) |
| 404 | Not found |
| 422 | Validation error (schema, required fields) |
| 500 | Server error |

---

## 7. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| GITHUB_CLIENT_ID | Yes | GitHub OAuth app client ID |
| GITHUB_CLIENT_SECRET | Yes | GitHub OAuth app client secret |
| GITHUB_CALLBACK_URL | Yes | Full callback URL |
| JWT_SECRET | Yes | Secret for signing JWTs |
| JWT_EXPIRY_HOURS | No | Token expiry (default: 24) |
| JWT_COOKIE_NAME | No | Cookie name (default: surveyflow_token) |
| FRONTEND_URL | Yes | Frontend URL for CORS and redirects |
| ALLOWED_GITHUB_ORGS | No | Comma-separated org names |

---

## 8. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| OAuth tokens server-side only | Never expose GitHub tokens to frontend |
| HTTP-only cookies for JWT | Set httponly=True, secure=True in production |
| CSRF protection | Validate Origin header on state-changing requests |
| SQL injection prevention | Use SQLAlchemy ORM with parameterized queries |
| Input validation | Pydantic schemas on all endpoints |
| Rate limiting | Limit auth attempts per IP |
| CORS | Restrict to FRONTEND_URL origin |

---

## 9. Testing Requirements

| Test Type | Coverage |
|-----------|----------|
| Unit tests | All services and utilities |
| Integration tests | All API endpoints |
| Auth flow tests | OAuth flow, JWT validation |
| Validation tests | All question types, schema validation |
| Export tests | JSON and CSV generation |

---

## 10. Deployment

### Railway Configuration

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/v1/health"
restartPolicyType = "on_failure"
```

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

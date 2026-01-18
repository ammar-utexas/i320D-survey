# Product Requirements Document: Survey Platform

## Document Information

| Field | Value |
|-------|-------|
| Product Name | SurveyFlow |
| Version | 1.0 |
| Author | Ammar / Claude |
| Date | January 2026 |
| Status | Draft |

---

## 1. Executive Summary

SurveyFlow is a lightweight, self-hosted survey platform designed for educators, researchers, and small teams who need to collect structured responses and analyze them for decision-making (e.g., student pairing, team formation, needs assessment). The platform supports JSON-defined surveys with multiple question types and uses GitHub OAuth for authentication to leverage existing institutional or organizational identities.

---

## 2. Problem Statement

Existing survey tools (Google Forms, Typeform, Qualtrics) are either too simple for structured analysis, too expensive for small-scale use, or require creating separate accounts. Educators and team leads need a solution that:

- Renders surveys from a simple, versionable configuration format (JSON)
- Authenticates users via existing GitHub accounts (common in technical/academic settings)
- Exports responses in formats suitable for algorithmic processing (CSV, JSON)
- Can be self-hosted for data privacy compliance

---

## 3. Target Users

| User Type | Description | Primary Goals |
|-----------|-------------|---------------|
| Survey Administrator | Instructor, team lead, or researcher | Create surveys, distribute links, export and analyze responses |
| Survey Respondent | Student, team member, or participant | Complete surveys quickly via familiar authentication |

---

## 4. Goals and Success Metrics

### Goals

1. Enable administrators to deploy a survey within 10 minutes of uploading a JSON configuration
2. Provide a frictionless respondent experience with single-click GitHub authentication
3. Export responses in machine-readable formats for downstream analysis (pairing algorithms, dashboards)

### Success Metrics

| Metric | Target |
|--------|--------|
| Survey deployment time | < 10 minutes |
| Survey completion rate | > 85% |
| Response export formats | JSON, CSV |
| Authentication success rate | > 99% |

---

## 5. Features and Requirements

### 5.1 Authentication

| Requirement | Priority | Description |
|-------------|----------|-------------|
| AUTH-01 | P0 | GitHub OAuth 2.0 login for all users |
| AUTH-02 | P0 | Store GitHub username, email, and avatar URL upon login |
| AUTH-03 | P1 | Session management with JWT tokens (24-hour expiry) |
| AUTH-04 | P1 | Logout functionality that clears session |
| AUTH-05 | P2 | Optional: restrict login to specific GitHub organizations |

### 5.2 Survey Management (Admin)

| Requirement | Priority | Description |
|-------------|----------|-------------|
| ADMIN-01 | P0 | Upload JSON survey configuration file |
| ADMIN-02 | P0 | Validate JSON schema on upload with clear error messages |
| ADMIN-03 | P0 | Generate unique shareable survey URL |
| ADMIN-04 | P1 | Set survey open/close dates |
| ADMIN-05 | P1 | View list of respondents and completion status |
| ADMIN-06 | P1 | Export all responses as JSON or CSV |
| ADMIN-07 | P2 | Edit survey metadata (title, description) without re-upload |
| ADMIN-08 | P2 | Duplicate existing survey |
| ADMIN-09 | P2 | Archive/delete surveys |

### 5.3 Survey Rendering (Respondent)

| Requirement | Priority | Description |
|-------------|----------|-------------|
| RESP-01 | P0 | Render all question types defined in JSON schema |
| RESP-02 | P0 | Group questions by vector/section with visual separation |
| RESP-03 | P0 | Validate required fields before submission |
| RESP-04 | P1 | Auto-save responses as user progresses |
| RESP-05 | P1 | Allow respondent to edit responses before survey closes |
| RESP-06 | P1 | Mobile-responsive design |
| RESP-07 | P2 | Progress indicator showing completion percentage |
| RESP-08 | P2 | Keyboard navigation support |

### 5.4 Question Types

The platform must support the following question types:

| Type ID | Display | Stored Value |
|---------|---------|--------------|
| `scale_1_5` | 5-point radio buttons or slider with labels (1=Low, 5=High) | Integer 1-5 |
| `single_choice` | Radio button group | String (selected option) |
| `multi_checkbox` | Checkbox group | Array of strings |
| `dropdown` | Select dropdown | String (selected option) |
| `single_choice_with_text` | Radio buttons + conditional text field | Object: `{choice: string, text: string}` |
| `open_text` | Textarea (max 1000 characters) | String |

### 5.5 Data Export

| Requirement | Priority | Description |
|-------------|----------|-------------|
| EXPORT-01 | P0 | Export as JSON with full response structure |
| EXPORT-02 | P0 | Export as flattened CSV (one row per respondent) |
| EXPORT-03 | P1 | Include respondent metadata (GitHub username, submission timestamp) |
| EXPORT-04 | P2 | Filter export by date range |
| EXPORT-05 | P2 | Anonymized export option (strip GitHub identifiers) |

---

## 6. Technical Architecture

### 6.1 System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Web Client    │────▶│   FastAPI       │────▶│    Database     │
│   (React/Vite)  │     │   (Python)      │     │   (PostgreSQL)  │
│   on Vercel     │     │   on Railway    │     │   on Railway    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  GitHub OAuth   │
                        │                 │
                        └─────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + Vite | Simple setup, fast dev server, not course focus |
| CSS Framework | Tailwind CSS | Rapid styling, mobile-responsive utilities |
| Backend | FastAPI (Python 3.11+) | Async support, automatic OpenAPI docs, Pydantic validation |
| ORM | SQLAlchemy 2.0 + Alembic | Async support, migrations, mature ecosystem |
| Database | PostgreSQL | Relational integrity, JSONB column for survey configs |
| Authentication | GitHub OAuth 2.0 via Authlib | Well-maintained Python OAuth library |
| Frontend Hosting | Vercel | Free tier, optimized for React/Vite |
| Backend Hosting | Railway | Free tier, native PostgreSQL, easy FastAPI deployment |

### 6.3 Project Structure

```
surveyflow/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings via pydantic-settings
│   │   ├── database.py          # SQLAlchemy async engine
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── survey.py
│   │   │   └── response.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # Pydantic request/response models
│   │   │   ├── survey.py
│   │   │   └── response.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # GitHub OAuth endpoints
│   │   │   ├── surveys.py       # Survey CRUD
│   │   │   └── responses.py     # Response submission
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── github.py        # GitHub OAuth logic
│   │   │   └── export.py        # CSV/JSON export
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── security.py      # JWT handling
│   ├── alembic/                 # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.toml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionRenderer.jsx   # Renders question by type
│   │   │   ├── SurveyForm.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/                 # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── surveys/                     # Example survey JSON files
│   └── student_pairing.json
│
└── README.md
```

### 6.4 API Endpoints

All endpoints are prefixed with `/api/v1`. FastAPI auto-generates OpenAPI docs at `/docs`.

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/github` | Initiate GitHub OAuth flow (redirects to GitHub) |
| GET | `/auth/github/callback` | Handle OAuth callback, issue JWT, redirect to frontend |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current authenticated user |

#### Surveys (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/surveys` | Create survey from JSON config |
| GET | `/surveys` | List all surveys for current admin |
| GET | `/surveys/{survey_id}` | Get survey details and config |
| PATCH | `/surveys/{survey_id}` | Update survey metadata (title, dates) |
| DELETE | `/surveys/{survey_id}` | Soft-delete survey |
| GET | `/surveys/{survey_id}/responses` | List all responses with user info |
| GET | `/surveys/{survey_id}/export` | Export responses (query: `?format=csv\|json`) |

#### Responses (Respondent)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/surveys/{slug}/public` | Get survey for rendering (public, no auth for metadata) |
| POST | `/surveys/{slug}/respond` | Submit or update response (upsert) |
| GET | `/surveys/{slug}/my-response` | Get current user's saved response |

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check for Railway |

---

## 7. Data Models

### 7.1 User

```json
{
  "id": "uuid",
  "github_id": "integer",
  "github_username": "string",
  "email": "string",
  "avatar_url": "string",
  "is_admin": "boolean",
  "created_at": "timestamp",
  "last_login_at": "timestamp"
}
```

### 7.2 Survey

```json
{
  "id": "uuid",
  "slug": "string (unique, URL-safe)",
  "title": "string",
  "description": "string",
  "config": "jsonb (full survey JSON)",
  "created_by": "uuid (user.id)",
  "opens_at": "timestamp",
  "closes_at": "timestamp",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 7.3 Response

```json
{
  "id": "uuid",
  "survey_id": "uuid",
  "user_id": "uuid",
  "answers": "jsonb",
  "submitted_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## 8. Survey JSON Schema

The following schema defines the structure for survey configuration files:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["survey_title", "vectors"],
  "properties": {
    "survey_title": { "type": "string" },
    "description": { "type": "string" },
    "vectors": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["vector_id", "vector_name", "questions"],
        "properties": {
          "vector_id": { "type": "string" },
          "vector_name": { "type": "string" },
          "pairing_strategy": { "enum": ["match", "complement"] },
          "questions": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["question_id", "question", "type"],
              "properties": {
                "question_id": { "type": "string" },
                "question": { "type": "string" },
                "type": {
                  "enum": [
                    "scale_1_5",
                    "single_choice",
                    "multi_checkbox",
                    "dropdown",
                    "single_choice_with_text",
                    "open_text"
                  ]
                },
                "options": { "type": "array", "items": { "type": "string" } },
                "text_prompt": { "type": "string" },
                "required": { "type": "boolean", "default": true }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 9. Example Survey Configuration

The following is a complete example of a student pairing survey:

```json
{
  "survey_title": "Student Pairing Survey",
  "description": "This survey helps us understand your skills, availability, and working style to pair you with a compatible teammate.",
  "vectors": [
    {
      "vector_id": "technical_skills",
      "vector_name": "Technical Skills & Background",
      "pairing_strategy": "complement",
      "questions": [
        {
          "question_id": "Q1",
          "question": "Rate your comfort level with Python programming.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q2",
          "question": "Rate your experience with data manipulation libraries (pandas, NumPy).",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q3",
          "question": "Rate your comfort with statistical analysis and hypothesis testing.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q4",
          "question": "Rate your experience with data visualization (matplotlib, seaborn, Tableau).",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q5",
          "question": "Rate your familiarity with machine learning concepts and tools.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q6",
          "question": "Rate your experience working with healthcare or biomedical datasets.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q7",
          "question": "Rate your comfort with SQL or database querying.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q8",
          "question": "What technical skill do you most want to improve this semester?",
          "type": "open_text"
        },
        {
          "question_id": "Q9",
          "question": "What is a technical strength you could teach a teammate?",
          "type": "open_text"
        }
      ]
    },
    {
      "vector_id": "commitment_availability",
      "vector_name": "Commitment & Availability",
      "pairing_strategy": "match",
      "questions": [
        {
          "question_id": "Q10",
          "question": "How many hours per week do you realistically plan to dedicate to this course outside of class?",
          "type": "dropdown",
          "options": ["<3", "3-5", "5-8", "8-12", "12+"]
        },
        {
          "question_id": "Q11",
          "question": "How would you describe your typical approach to deadlines?",
          "type": "single_choice",
          "options": [
            "I prefer to finish well ahead of time",
            "I work steadily and finish on time",
            "I tend to work best closer to the deadline"
          ]
        },
        {
          "question_id": "Q12",
          "question": "What grade outcome are you aiming for in this course?",
          "type": "single_choice",
          "options": [
            "A (high achievement is a priority)",
            "B (solid performance, balanced with other commitments)",
            "Pass (completing requirements is my main goal)"
          ]
        },
        {
          "question_id": "Q13",
          "question": "Which time blocks are you typically available for team meetings?",
          "type": "multi_checkbox",
          "options": [
            "Weekday mornings",
            "Weekday afternoons",
            "Weekday evenings",
            "Weekend mornings",
            "Weekend afternoons",
            "Weekend evenings"
          ]
        },
        {
          "question_id": "Q14",
          "question": "Do you have any major commitments this semester that might affect your availability?",
          "type": "single_choice_with_text",
          "options": ["Yes", "No"],
          "text_prompt": "If yes, please describe:"
        }
      ]
    },
    {
      "vector_id": "communication_collaboration",
      "vector_name": "Communication & Collaboration Style",
      "pairing_strategy": "match",
      "questions": [
        {
          "question_id": "Q15",
          "question": "I am comfortable giving constructive feedback to teammates.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q16",
          "question": "I am comfortable receiving critical feedback on my work.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q17",
          "question": "I prefer frequent check-ins with teammates rather than working independently until deadlines.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q18",
          "question": "I am comfortable speaking up when I disagree with a teammate's approach.",
          "type": "scale_1_5"
        },
        {
          "question_id": "Q19",
          "question": "When facing a disagreement in a team, I usually:",
          "type": "single_choice",
          "options": [
            "Advocate strongly for my position",
            "Look for compromise",
            "Defer to others to avoid conflict",
            "Seek outside input to resolve it"
          ]
        },
        {
          "question_id": "Q20",
          "question": "How do you prefer to communicate with teammates?",
          "type": "single_choice",
          "options": [
            "Synchronous (video calls, in-person)",
            "Asynchronous (Slack, email, shared docs)",
            "A mix of both"
          ]
        },
        {
          "question_id": "Q21",
          "question": "Describe a positive team experience you have had. What made it work?",
          "type": "open_text"
        },
        {
          "question_id": "Q22",
          "question": "Describe a frustrating team experience. What went wrong?",
          "type": "open_text"
        }
      ]
    },
    {
      "vector_id": "perspective_problem_solving",
      "vector_name": "Perspective & Problem-Solving",
      "pairing_strategy": "complement",
      "questions": [
        {
          "question_id": "Q23",
          "question": "When starting a new data problem, I tend to:",
          "type": "single_choice",
          "options": [
            "Dive into the data and explore first",
            "Plan my approach carefully before touching the data",
            "Look for similar examples or tutorials to guide me"
          ]
        },
        {
          "question_id": "Q24",
          "question": "What is your primary academic or professional background?",
          "type": "single_choice",
          "options": [
            "Computer Science / Engineering",
            "Biology / Life Sciences",
            "Healthcare / Clinical",
            "Statistics / Mathematics",
            "Business / Other",
            "Undecided / Interdisciplinary"
          ]
        },
        {
          "question_id": "Q25",
          "question": "When interpreting results, I am more drawn to:",
          "type": "single_choice",
          "options": [
            "Technical accuracy and methodological rigor",
            "Practical implications and real-world applicability",
            "Both equally"
          ]
        },
        {
          "question_id": "Q26",
          "question": "What is a biomedical or healthcare problem you would be excited to explore with data?",
          "type": "open_text"
        }
      ]
    }
  ]
}
```

---

## 10. User Interface Wireframes

### 10.1 Login Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                       SurveyFlow                            │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │                             │                │
│              │   🔒 Sign in with GitHub    │                │
│              │                             │                │
│              └─────────────────────────────┘                │
│                                                             │
│           Secure authentication via GitHub OAuth            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  SurveyFlow          [avatar] johndoe ▼                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  My Surveys                          [+ Create Survey]      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Student Pairing Survey                                │  │
│  │ 24/30 responses · Closes Jan 25, 2026                 │  │
│  │ [View] [Export ▼] [Edit] [Delete]                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Team Feedback Q1                                      │  │
│  │ 12/12 responses · Closed                              │  │
│  │ [View] [Export ▼] [Duplicate] [Delete]                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 10.3 Survey Respondent View

```
┌─────────────────────────────────────────────────────────────┐
│  Student Pairing Survey                    [avatar] jane    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This survey helps us understand your skills...             │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 40% complete        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Technical Skills & Background                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │ 1. Rate your comfort level with Python programming.   │  │
│  │                                                       │  │
│  │    ○ 1    ○ 2    ● 3    ○ 4    ○ 5                    │  │
│  │    Novice                       Expert                │  │
│  │                                                       │  │
│  │ 2. Rate your experience with data manipulation...     │  │
│  │                                                       │  │
│  │    ○ 1    ○ 2    ○ 3    ● 4    ○ 5                    │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                          [Save Draft]  [Submit Survey]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Security Considerations

| Concern | Mitigation |
|---------|------------|
| OAuth token exposure | Store tokens server-side only; use HTTP-only cookies |
| CSRF attacks | Implement CSRF tokens on all state-changing requests |
| SQL injection | Use parameterized queries / ORM |
| XSS | Sanitize all user input; use Content Security Policy headers |
| Data privacy | Support anonymized exports; HTTPS only; optional self-hosting |
| Rate limiting | Limit login attempts and API calls per IP |

---

## 12. Deployment

### 12.1 Backend (Railway)

Railway provides a simple deployment experience with native PostgreSQL support.

**railway.toml:**
```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/v1/health"
restartPolicyType = "on_failure"
```

**Environment Variables (Railway Dashboard):**
```
# GitHub OAuth (create at github.com/settings/developers)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=https://your-app.railway.app/api/v1/auth/github/callback

# Database (auto-populated by Railway PostgreSQL plugin)
DATABASE_URL=postgresql://...

# Security
JWT_SECRET=generate-a-long-random-string
JWT_EXPIRY_HOURS=24

# Frontend URL (for CORS and redirects)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Restrict to specific GitHub orgs
ALLOWED_GITHUB_ORGS=myorg,anotherog
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Run migrations and start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

**requirements.txt:**
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy[asyncio]>=2.0.25
asyncpg>=0.29.0
alembic>=1.13.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
authlib>=1.3.0
httpx>=0.26.0
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.6
```

### 12.2 Frontend (Vercel)

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

**Environment Variables (Vercel Dashboard):**
```
VITE_API_URL=https://your-app.railway.app/api/v1
```

### 12.3 Deployment Steps

**Backend (Railway):**
1. Create account at railway.app
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL plugin (click "+ New" → Database → PostgreSQL)
4. Set environment variables in Settings → Variables
5. Railway auto-deploys on push to main

**Frontend (Vercel):**
1. Create account at vercel.com
2. Import Git repository (select frontend folder as root)
3. Set `VITE_API_URL` environment variable
4. Deploy

**GitHub OAuth App:**
1. Go to github.com → Settings → Developer settings → OAuth Apps → New
2. Set Homepage URL to your frontend URL
3. Set Authorization callback URL to `https://your-backend.railway.app/api/v1/auth/github/callback`
4. Copy Client ID and Client Secret to Railway environment variables

---

## 13. Future Enhancements (Out of Scope for v1.0)

| Feature | Description |
|---------|-------------|
| Pairing algorithm | Built-in algorithm that uses vector strategies to suggest optimal pairs |
| Conditional logic | Show/hide questions based on previous answers |
| Multiple auth providers | Support Google, Microsoft, SAML SSO |
| Webhooks | Notify external systems on survey completion |
| Analytics dashboard | Visualize response distributions per question |
| Branching surveys | Different question paths based on responses |
| Team/organization support | Multi-tenant with role-based access |

---

## 14. Open Questions

1. Should admins be able to define custom scoring weights per vector?
2. Do we need support for anonymous surveys (no authentication)?
3. Should the platform support internationalization (i18n) in v1.0?
4. What is the maximum expected number of concurrent respondents?

---

## 15. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Vector | A category of questions measuring a specific trait (e.g., technical skills) |
| Pairing Strategy | Whether to match similar respondents or complement different ones |
| Slug | A URL-safe identifier for a survey (e.g., `student-pairing-2026`) |

### B. References

- GitHub OAuth Documentation: https://docs.github.com/en/developers/apps/building-oauth-apps
- JSON Schema Specification: https://json-schema.org/

# SurveyFlow Backend - Multi-Stage Delivery Plan

## Overview

This document outlines the phased delivery of the SurveyFlow backend API. Each stage is self-contained with clear deliverables, enabling incremental development and early integration with the frontend.

## Stage Summary

| Stage | Name | Priority | Dependencies | Key Deliverables |
|-------|------|----------|--------------|------------------|
| 1 | [Foundation & Authentication](./stage-1-foundation.md) | P0 | None | Project setup, GitHub OAuth, JWT |
| 2 | [Survey Public API](./stage-2-survey-public-api.md) | P0 | Stage 1 | Survey retrieval, response submission |
| 3 | [Admin Survey CRUD](./stage-3-admin-survey-crud.md) | P0 | Stage 2 | Create, update, delete, duplicate surveys |
| 4 | [Export & Response Management](./stage-4-export-advanced.md) | P1 | Stage 3 | Response list, JSON/CSV export |

## Dependency Graph

```
Stage 1: Foundation & Auth
    │
    ▼
Stage 2: Survey Public API (Respondent)
    │
    ▼
Stage 3: Admin Survey CRUD
    │
    ▼
Stage 4: Export & Response Management
```

**Sequential Path**: Backend stages are sequential as each builds on the previous.

## Frontend Coordination

| Backend Stage | Coordinates With | Integration Point |
|---------------|------------------|-------------------|
| Stage 1 | Frontend Stage 1 | OAuth flow, user session |
| Stage 2 | Frontend Stages 2-3 | Survey rendering, response submission |
| Stage 3 | Frontend Stage 4 | Survey creation, URL sharing |
| Stage 4 | Frontend Stage 5 | Response table, export downloads |

## MVP Definition

**Minimum Viable Product (Stages 1-3)**:
- Users can authenticate via GitHub OAuth
- Admins can create surveys and get shareable URLs
- Respondents can view and submit survey responses

**Full Product (+ Stage 4)**:
- Admins can view response tables
- Admins can export data as JSON or CSV
- Filtering and anonymization options

## Milestone Checkpoints

| Milestone | Stages Complete | API Capability |
|-----------|-----------------|----------------|
| M1: Auth Working | 1 | OAuth login, JWT sessions |
| M2: Surveys Accessible | 1, 2 | Public survey retrieval, response submission |
| M3: Admin CRUD | 1-3 | Full survey management |
| M4: Feature Complete | All | Export and response management |

## API Endpoints by Stage

### Stage 1 Endpoints
- `GET /api/v1/health`
- `GET /api/v1/auth/github`
- `GET /api/v1/auth/github/callback`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Stage 2 Endpoints
- `GET /api/v1/surveys/{slug}/public`
- `POST /api/v1/surveys/{slug}/respond`
- `GET /api/v1/surveys/{slug}/my-response`

### Stage 3 Endpoints
- `POST /api/v1/surveys`
- `GET /api/v1/surveys`
- `GET /api/v1/surveys/{survey_id}`
- `PATCH /api/v1/surveys/{survey_id}`
- `DELETE /api/v1/surveys/{survey_id}`
- `POST /api/v1/surveys/{survey_id}/duplicate`

### Stage 4 Endpoints
- `GET /api/v1/surveys/{survey_id}/responses`
- `GET /api/v1/surveys/{survey_id}/export`

## Database Migrations by Stage

| Stage | Migration | Tables |
|-------|-----------|--------|
| 1 | 001_create_users_table | users |
| 2 | 002_create_surveys_table | surveys |
| 2 | 003_create_responses_table | responses |

## Constitution Alignment

All stages adhere to the [Constitution](../memory/constitution.md):

| Principle | Enforcement |
|-----------|-------------|
| I. Security-First | HTTP-only cookies, server-side OAuth tokens |
| II. Type Safety | Pydantic schemas, type hints, MyPy |
| III. Async-First | SQLAlchemy async, async handlers |
| IV. Testing | Pytest fixtures, test database |
| V. Code Quality | Black, Ruff, separated services |
| VI. RESTful API | Versioned endpoints, proper status codes |
| VII. Simplicity | Minimal implementation |

## How to Use This Plan

1. **Start a stage**: Read the stage document thoroughly
2. **Track progress**: Use the acceptance criteria as a checklist
3. **Coordinate**: Check "Coordinates With" for frontend integration points
4. **Complete stage**: Verify all acceptance criteria pass
5. **Move to next**: Only proceed when current stage is complete

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial 4-stage delivery plan |

# Implementation Plan: Backend Foundation & Authentication

**Branch**: `001-backend-foundation` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-foundation/spec.md`

## Summary

Establish the FastAPI backend foundation with async PostgreSQL connectivity, GitHub OAuth authentication, and JWT session management using HTTP-only cookies. This is the critical path for all subsequent features - no other functionality can proceed until users can authenticate.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLAlchemy 2.0 (async), Authlib, python-jose, Pydantic v2
**Storage**: PostgreSQL (via asyncpg driver)
**Testing**: pytest with pytest-asyncio
**Target Platform**: Linux server (Railway deployment)
**Project Type**: Web backend API
**Performance Goals**: Auth flow completes in <10 seconds; protected endpoints respond in <100ms
**Constraints**: HTTP-only cookies for JWT; server-side OAuth token storage only
**Scale/Scope**: Educational survey platform; moderate concurrent users during class sessions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Security-First | PASS | HTTP-only cookies, server-side OAuth tokens, HTTPS-only production, parameterized queries via SQLAlchemy ORM |
| II. Type Safety | PASS | Type hints on all functions, Pydantic v2 for validation, typed SQLAlchemy columns |
| III. Async-First | PASS | Async SQLAlchemy sessions, async route handlers, async GitHub API calls |
| IV. Testing Discipline | PASS | pytest fixtures for auth, isolated test database, integration tests for OAuth flow |
| V. Code Quality | PASS | Black formatter, Ruff linting, MyPy type checking |
| VI. RESTful API | PASS | /api/v1 versioning, proper HTTP methods and status codes |
| VII. Simplicity/YAGNI | PASS | Only required features; org restriction deferred; no premature abstractions |

**Gate Status**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-foundation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
│   └── auth-api.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, router mounting
│   ├── config.py            # pydantic-settings configuration
│   ├── database.py          # Async SQLAlchemy engine & session
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py          # User SQLAlchemy model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py          # Pydantic request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # GitHub OAuth & session endpoints
│   │   └── health.py        # Health check endpoint
│   ├── services/
│   │   ├── __init__.py
│   │   └── github.py        # GitHub OAuth client logic
│   └── utils/
│       ├── __init__.py
│       └── security.py      # JWT encode/decode, auth dependencies
├── alembic/
│   ├── versions/
│   │   └── 001_create_users_table.py
│   └── env.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures (db, auth, client)
│   └── test_auth.py         # Authentication flow tests
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── railway.toml
└── .env.example
```

**Structure Decision**: Standard FastAPI project structure with clear separation between models (SQLAlchemy), schemas (Pydantic), routers (endpoints), services (business logic), and utils (helpers). This matches the CLAUDE.md conventions and constitution principles.

## Complexity Tracking

> No violations requiring justification. Constitution check passed.

# Tasks: Backend Foundation & Authentication

**Input**: Design documents from `/specs/001-backend-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Tests are omitted but can be added by running `/speckit.tasks` with TDD flag.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/` for source, `tests/` for tests (FastAPI project structure per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure per plan.md with `app/`, `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`, `app/utils/`, `alembic/`, `tests/` directories
- [x] T002 Create `requirements.txt` with pinned dependencies: fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic, pydantic-settings, authlib, httpx, python-jose[cryptography], python-multipart
- [x] T003 [P] Create `app/__init__.py` (empty module init)
- [x] T004 [P] Create `app/models/__init__.py` (empty module init)
- [x] T005 [P] Create `app/schemas/__init__.py` (empty module init)
- [x] T006 [P] Create `app/routers/__init__.py` (empty module init)
- [x] T007 [P] Create `app/services/__init__.py` (empty module init)
- [x] T008 [P] Create `app/utils/__init__.py` (empty module init)
- [x] T009 [P] Create `tests/__init__.py` (empty module init)
- [x] T010 Create `.env.example` with all required environment variables per research.md

**Checkpoint**: Project skeleton ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Implement `app/config.py` with pydantic-settings Settings class containing DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL, JWT_SECRET, JWT_EXPIRY_HOURS, JWT_ALGORITHM, JWT_COOKIE_NAME, FRONTEND_URL
- [x] T012 Implement `app/database.py` with async SQLAlchemy engine, AsyncSessionLocal factory, Base declarative base, and get_db dependency
- [x] T013 Initialize Alembic with `alembic.ini` configuration pointing to async database URL
- [x] T014 Configure `alembic/env.py` for async migrations with SQLAlchemy models import
- [x] T015 [P] Implement User model in `app/models/user.py` with id (UUID), github_id (Integer, unique), github_username (String), email (String, nullable), avatar_url (String, nullable), is_admin (Boolean, default False), created_at (DateTime), last_login_at (DateTime)
- [x] T016 [P] Implement UserResponse schema in `app/schemas/user.py` with id, github_username, email, avatar_url, is_admin fields and ConfigDict(from_attributes=True)
- [x] T017 Create initial migration `alembic/versions/001_create_users_table.py` using `alembic revision --autogenerate -m "create users table"`
- [x] T018 Implement `app/utils/security.py` with create_access_token(user_id) and decode_access_token(token) functions using python-jose
- [x] T019 Implement get_current_user dependency in `app/utils/security.py` that extracts JWT from cookie, decodes it, and fetches user from database
- [x] T020 [P] Implement `app/services/github.py` with get_authorization_url(), exchange_code_for_token(code), and get_github_user(token) async functions using Authlib
- [x] T021 Implement `app/main.py` with FastAPI app creation, CORS middleware (allow_origins=[FRONTEND_URL], allow_credentials=True), and router mounting with /api/v1 prefix

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - New User GitHub Login (Priority: P1) MVP

**Goal**: A new user can authenticate via GitHub OAuth and have their account created automatically

**Independent Test**: Click "Sign in with GitHub", authorize on GitHub, verify redirect back with session cookie and user record created in database

### Implementation for User Story 1

- [x] T022 [US1] Implement GET `/auth/github` endpoint in `app/routers/auth.py` that redirects to GitHub authorization URL with state parameter
- [x] T023 [US1] Implement state parameter generation and storage (using signed cookie or in-memory) in `app/routers/auth.py`
- [x] T024 [US1] Implement GET `/auth/github/callback` endpoint in `app/routers/auth.py` that validates state, exchanges code for token, fetches GitHub user profile
- [x] T025 [US1] Implement user creation logic in callback: check if github_id exists, create new User if not found, store in database
- [x] T026 [US1] Implement JWT cookie setting in callback response with httponly=True, secure=True (production), samesite="lax", max_age=JWT_EXPIRY_HOURS*3600
- [x] T027 [US1] Implement redirect to FRONTEND_URL after successful authentication in `app/routers/auth.py`
- [x] T028 [US1] Implement error redirect to FRONTEND_URL with query params (e.g., ?error=oauth_failed&reason=<cause>) for OAuth failures
- [x] T029 [US1] Register auth router in `app/main.py` with `app.include_router(auth.router, prefix="/api/v1", tags=["auth"])`

**Checkpoint**: New users can sign in with GitHub and accounts are created automatically

---

## Phase 4: User Story 2 - Returning User Session Persistence (Priority: P1)

**Goal**: Returning users with valid session cookies are automatically recognized as authenticated

**Independent Test**: Log in, close browser, reopen, call GET /auth/me and verify user profile is returned without re-login

### Implementation for User Story 2

- [x] T030 [US2] Implement GET `/auth/me` endpoint in `app/routers/auth.py` that uses get_current_user dependency
- [x] T031 [US2] Return UserResponse schema from `/auth/me` endpoint with user profile data
- [x] T032 [US2] Implement 401 response when no valid cookie present or token expired in get_current_user dependency
- [x] T033 [US2] Implement user update logic in OAuth callback for returning users: update github_username, email, avatar_url, last_login_at fields

**Checkpoint**: Session persistence works - returning users stay authenticated

---

## Phase 5: User Story 3 - User Logout (Priority: P2)

**Goal**: Authenticated users can end their session by logging out

**Independent Test**: Log in, call POST /auth/logout, verify cookie is cleared and subsequent /auth/me returns 401

### Implementation for User Story 3

- [x] T034 [US3] Implement POST `/auth/logout` endpoint in `app/routers/auth.py` that requires authentication via get_current_user dependency
- [x] T035 [US3] Clear session cookie in logout response by setting max_age=0 and empty value
- [x] T036 [US3] Return MessageResponse {"message": "Successfully logged out"} from logout endpoint

**Checkpoint**: Users can securely end their sessions

---

## Phase 6: User Story 4 - System Health Verification (Priority: P2)

**Goal**: Operations staff can verify the backend service is running

**Independent Test**: Call GET /health and verify {"status": "healthy"} response

### Implementation for User Story 4

- [x] T037 [P] [US4] Create `app/routers/health.py` with GET `/health` endpoint returning {"status": "healthy"}
- [x] T038 [US4] Register health router in `app/main.py` with `app.include_router(health.router, prefix="/api/v1", tags=["health"])`

**Checkpoint**: Health endpoint available for monitoring and deployment verification

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Deployment readiness and documentation

- [x] T039 [P] Create `Dockerfile` with Python 3.11-slim base, requirements install, alembic upgrade head && uvicorn startup command
- [x] T040 [P] Create `railway.toml` with dockerfile builder and /api/v1/health healthcheck path
- [x] T041 [P] Create `tests/conftest.py` with pytest fixtures for async test client, test database session, and authenticated user
- [ ] T042 Verify all endpoints work by running quickstart.md validation steps manually
- [ ] T043 Run code quality checks: `black app/`, `ruff check app/`, `mypy app/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but US2 depends on auth flow from US1
  - US3 and US4 are P2 and can proceed after US1/US2
- **Polish (Phase 7)**: Can proceed in parallel once core functionality complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - OAuth login flow
- **User Story 2 (P1)**: Depends on US1 (needs auth callback to set cookies) - Session verification
- **User Story 3 (P2)**: Depends on US1/US2 (needs working auth) - Logout
- **User Story 4 (P2)**: Can start after Foundational - Health check (independent)

### Within Each User Story

- Routes depend on services/utils being ready
- Services depend on models being ready
- Schema validation happens at router level

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003-T009 can all run in parallel (module init files)

**Phase 2 (Foundational)**:
- T015, T016 can run in parallel (model and schema)
- T018, T020 can run in parallel (security utils and github service)

**Phase 6-7**:
- T037 can run in parallel with other user stories
- T039, T040, T041 can all run in parallel (deployment files)

---

## Parallel Example: Foundational Phase

```bash
# Launch foundational parallel tasks together:
Task: "Implement User model in app/models/user.py"
Task: "Implement UserResponse schema in app/schemas/user.py"

# Then after models ready:
Task: "Implement security utilities in app/utils/security.py"
Task: "Implement GitHub OAuth service in app/services/github.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (New User GitHub Login)
4. Complete Phase 4: User Story 2 (Session Persistence)
5. **STOP and VALIDATE**: Test full login flow independently
6. Deploy/demo if ready - users can log in and stay logged in!

### Full Feature Delivery

1. Complete MVP (Phases 1-4)
2. Add Phase 5: User Story 3 (Logout)
3. Add Phase 6: User Story 4 (Health Check)
4. Complete Phase 7: Polish
5. Run all quality checks and manual validation

### Task Count Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Phase 1: Setup | 10 | 7 |
| Phase 2: Foundational | 11 | 4 |
| Phase 3: US1 - GitHub Login | 8 | 0 |
| Phase 4: US2 - Session | 4 | 0 |
| Phase 5: US3 - Logout | 3 | 0 |
| Phase 6: US4 - Health | 2 | 1 |
| Phase 7: Polish | 5 | 3 |
| **Total** | **43** | **15** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are both P1 but have logical dependency (US2 needs US1's auth flow)
- US4 (Health) is independent and can be done early if needed for deployment
- Constitution compliance verified in plan.md - all security, type safety, async patterns apply
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

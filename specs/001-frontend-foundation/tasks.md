# Tasks: Frontend Foundation & Authentication

**Input**: Design documents from `/specs/001-frontend-foundation/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/auth-api.md, research.md, quickstart.md

**Tests**: Not explicitly requested in specification - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `frontend/`
- **Source**: `frontend/src/`
- **Components**: `frontend/src/components/`
- **API modules**: `frontend/src/api/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Vite + React project with required dependencies

- [x] T001 Initialize Vite React project in `frontend/` using `npm create vite@latest . -- --template react`
- [x] T002 Install dependencies: react-router-dom@6, prop-types via npm
- [x] T003 [P] Install dev dependencies: tailwindcss, postcss, autoprefixer via npm
- [x] T004 [P] Configure Tailwind CSS in `frontend/tailwind.config.js` with content paths
- [x] T005 [P] Configure PostCSS in `frontend/postcss.config.js`
- [x] T006 Update `frontend/src/index.css` with Tailwind directives (@tailwind base, components, utilities)
- [x] T007 [P] Create `.env.example` with VITE_API_URL variable in `frontend/.env.example`
- [x] T008 [P] Configure ESLint for React in `frontend/.eslintrc.cjs`

---

## Phase 2: Foundational (API Client & Auth Infrastructure)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create base API client with credentials: 'include' in `frontend/src/api/client.js`
- [x] T010 [P] Create Auth API module (login, logout, me) in `frontend/src/api/auth.js`
- [x] T011 Create AuthContext with user state, loading, error in `frontend/src/contexts/AuthContext.jsx`
- [x] T012 Create useAuth hook in `frontend/src/hooks/useAuth.js`
- [x] T013 [P] Create Spinner component (sm, md, lg sizes) in `frontend/src/components/common/Spinner.jsx`
- [x] T014 [P] Create Button component (primary, secondary, danger variants) in `frontend/src/components/common/Button.jsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - GitHub Sign-In (Priority: P1) 🎯 MVP

**Goal**: Users can sign in using GitHub OAuth and access protected areas

**Independent Test**: Click "Sign in with GitHub" → Complete OAuth → See dashboard with profile

### Implementation for User Story 1

- [x] T015 [US1] Create LoginPage with GitHub sign-in button in `frontend/src/pages/LoginPage.jsx`
- [x] T016 [US1] Implement login() function in AuthContext that redirects to backend OAuth in `frontend/src/contexts/AuthContext.jsx`
- [x] T017 [US1] Add error message display from URL query params (?error=cancelled) in `frontend/src/pages/LoginPage.jsx`
- [x] T018 [US1] Create ProtectedRoute component with loading/redirect logic in `frontend/src/components/common/ProtectedRoute.jsx`
- [x] T019 [US1] Create placeholder Dashboard page for authenticated users in `frontend/src/pages/Dashboard.jsx`
- [x] T020 [US1] Configure routing with protected routes in `frontend/src/App.jsx`
- [x] T021 [US1] Update main.jsx with BrowserRouter and AuthProvider in `frontend/src/main.jsx`
- [x] T022 [US1] Add redirect from login to dashboard when already authenticated in `frontend/src/pages/LoginPage.jsx`

**Checkpoint**: User Story 1 complete - Users can sign in via GitHub and access dashboard

---

## Phase 4: User Story 2 - View Profile Information (Priority: P2)

**Goal**: Signed-in users see their GitHub avatar and username in the header

**Independent Test**: Sign in → Verify avatar and username displayed in header

### Implementation for User Story 2

- [x] T023 [P] [US2] Create UserMenu component with avatar and username display in `frontend/src/components/layout/UserMenu.jsx`
- [x] T024 [US2] Create Header component with logo and UserMenu in `frontend/src/components/layout/Header.jsx`
- [x] T025 [US2] Create Layout component with Header and Outlet in `frontend/src/components/layout/Layout.jsx`
- [x] T026 [US2] Integrate Layout into protected route structure in `frontend/src/App.jsx`
- [x] T027 [US2] Style avatar as circular image with proper sizing in `frontend/src/components/layout/UserMenu.jsx`

**Checkpoint**: User Story 2 complete - Profile information visible in header

---

## Phase 5: User Story 3 - Sign Out (Priority: P2)

**Goal**: Signed-in users can sign out via the user menu

**Independent Test**: Sign in → Click user menu → Click "Sign out" → Redirected to login

### Implementation for User Story 3

- [x] T028 [US3] Add dropdown menu toggle to UserMenu in `frontend/src/components/layout/UserMenu.jsx`
- [x] T029 [US3] Add "Sign out" option in dropdown menu in `frontend/src/components/layout/UserMenu.jsx`
- [x] T030 [US3] Implement logout() function in AuthContext (call API, clear state, redirect) in `frontend/src/contexts/AuthContext.jsx`
- [x] T031 [US3] Add keyboard accessibility to dropdown (Escape to close, Enter to select) in `frontend/src/components/layout/UserMenu.jsx`
- [x] T032 [US3] Add aria-expanded and aria-haspopup for accessibility in `frontend/src/components/layout/UserMenu.jsx`

**Checkpoint**: User Story 3 complete - Users can sign out

---

## Phase 6: User Story 4 - Handle Invalid Routes (Priority: P3)

**Goal**: Users see a helpful 404 page for non-existent routes

**Independent Test**: Navigate to /nonexistent → See "Page not found" with navigation option

### Implementation for User Story 4

- [x] T033 [US4] Create NotFound page with "Page not found" message in `frontend/src/pages/NotFound.jsx`
- [x] T034 [US4] Add link/button to return to dashboard or login in `frontend/src/pages/NotFound.jsx`
- [x] T035 [US4] Add catch-all route (*) pointing to NotFound in `frontend/src/App.jsx`

**Checkpoint**: User Story 4 complete - 404 page displays for invalid routes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T036 [P] Add focus ring styles to all interactive elements (buttons, links) via Tailwind config
- [x] T037 [P] Ensure all buttons have min 44px touch targets for mobile
- [x] T038 Add PropTypes to all components (Button, Spinner, ProtectedRoute, UserMenu, Header, Layout, LoginPage, NotFound, Dashboard)
- [x] T039 Add loading state display in ProtectedRoute while auth is being checked
- [x] T040 Test keyboard navigation through all interactive elements (Tab, Enter, Escape)
- [x] T041 Validate responsive design on mobile viewport (320px width)
- [x] T042 Run quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Extends US1 components but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Extends UserMenu from US2 but independently testable
- **User Story 4 (P3)**: Can start after Foundational - No dependencies on other stories

### Within Each Phase

- Tasks without [P] run sequentially
- Tasks with [P] can run in parallel
- AuthContext must exist before ProtectedRoute can be created
- Layout/Header depend on UserMenu being created first

### Parallel Opportunities

- T003, T004, T005, T007, T008 can run in parallel (Setup)
- T010, T013, T014 can run in parallel (Foundational)
- US1 and US4 can be developed in parallel (no dependencies)
- T036, T037 can run in parallel (Polish)

---

## Parallel Example: Foundational Phase

```bash
# After T009 (client.js) completes, these can run in parallel:
Task: "Create Auth API module in frontend/src/api/auth.js"
Task: "Create Spinner component in frontend/src/components/common/Spinner.jsx"
Task: "Create Button component in frontend/src/components/common/Button.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test login flow independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test sign-in flow → Deploy/Demo (MVP!)
3. Add User Story 2 → Test profile display → Deploy/Demo
4. Add User Story 3 → Test sign-out → Deploy/Demo
5. Add User Story 4 → Test 404 page → Deploy/Demo
6. Complete Polish → Final validation

### Suggested Order for Solo Developer

1. Setup (T001-T008) - ~30 min
2. Foundational (T009-T014) - ~1 hour
3. US1: Sign-In (T015-T022) - ~2 hours
4. US2: Profile (T023-T027) - ~1 hour
5. US3: Sign-Out (T028-T032) - ~1 hour
6. US4: 404 Page (T033-T035) - ~30 min
7. Polish (T036-T042) - ~1 hour

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All components must include PropTypes per constitution
- All buttons must have focus:ring-* classes per accessibility requirement
- All API calls must include credentials: 'include' per security requirement

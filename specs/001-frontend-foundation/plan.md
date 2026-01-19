# Implementation Plan: Frontend Foundation & Authentication

**Branch**: `001-frontend-foundation` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-frontend-foundation/spec.md`

## Summary

Establish the SurveyFlow frontend foundation with React 18, Vite, and Tailwind CSS. Implement GitHub OAuth authentication flow via backend API, protected routing, and core layout components (Header, UserMenu, Layout). Users will be able to sign in with GitHub, view their profile in the header, sign out, and see appropriate error pages for invalid routes.

## Technical Context

**Language/Version**: JavaScript (ES2022+) with JSX
**Primary Dependencies**: React 18.x, React Router v6, Tailwind CSS 3.x, Vite (latest)
**Storage**: N/A (authentication state via HTTP-only cookies managed by backend)
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend-only, communicates with separate backend)
**Performance Goals**: FCP < 1.5s on 3G, TTI < 3s on 3G, bundle < 200KB gzipped
**Constraints**: No localStorage for tokens, credentials: 'include' on all API calls
**Scale/Scope**: Foundation for multi-stage survey platform, ~15 components in Stage 1

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| I. Component-First | Reusable components, single responsibility | ✅ PASS | Layout, Header, Button, Spinner as standalone components |
| II. Accessibility-First | WCAG AA, keyboard nav, focus indicators | ✅ PASS | Focus rings on buttons, semantic HTML, aria-labels |
| III. Mobile-First | Responsive design, touch targets | ✅ PASS | Tailwind breakpoints, 44px min tap targets |
| IV. Security by Default | HTTP-only cookies, no localStorage tokens | ✅ PASS | credentials: 'include', no client-side token storage |
| V. Type Safety | PropTypes or TypeScript | ✅ PASS | PropTypes on all components |

**Technology Stack Compliance:**
- React 18.x ✅
- Vite (latest) ✅
- Tailwind CSS 3.x ✅
- React Router v6 ✅
- Fetch API (native) ✅
- React Context + hooks ✅

**Gate Result: PASS** - No constitution violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── api/
│   │   ├── client.js        # Base fetch wrapper
│   │   └── auth.js          # Auth endpoints (login, logout, me)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── layout/
│   │       ├── Layout.jsx
│   │       ├── Header.jsx
│   │       └── UserMenu.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── NotFound.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   └── hooks/
│   └── e2e/
│       └── auth.spec.js
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
└── .env.example
```

**Structure Decision**: Frontend-only web application following React/Vite conventions with domain-organized components.

## Complexity Tracking

No constitution violations requiring justification.

## Dependencies

### External Services

| Service | Purpose | Failure Mode |
|---------|---------|--------------|
| Backend API | OAuth flow, user data | Show error message, allow retry |
| GitHub OAuth | Authentication | Backend handles; frontend shows error on callback failure |

### Backend API Endpoints (Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/auth/github` | Initiate OAuth redirect |
| GET | `/api/v1/auth/github/callback` | Handle OAuth callback (backend) |
| GET | `/api/v1/auth/me` | Get current user info |
| POST | `/api/v1/auth/logout` | End session |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend not ready | Blocked | Mock API responses for development |
| OAuth misconfiguration | Auth fails | Clear error messages, backend coordination |
| Cookie issues (SameSite) | Auth fails | Verify CORS/cookie settings with backend |

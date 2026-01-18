# Research: Frontend Foundation & Authentication

**Feature**: 001-frontend-foundation
**Date**: 2026-01-18
**Status**: Complete

## Research Tasks

### 1. React 18 + Vite Project Setup

**Decision**: Use `npm create vite@latest` with React template

**Rationale**:
- Vite provides fast HMR and optimized builds out of the box
- React 18 template includes proper StrictMode setup
- Native ESM support for modern development

**Alternatives Considered**:
- Create React App: Deprecated, slower builds, heavier configuration
- Next.js: Overkill for SPA without SSR requirements
- Manual webpack setup: Unnecessary complexity

### 2. Tailwind CSS Integration with Vite

**Decision**: Follow official Tailwind + Vite installation guide

**Rationale**:
- PostCSS integration is straightforward
- JIT mode enabled by default for optimal dev experience
- Purging handles production bundle size automatically

**Configuration**:
```js
// tailwind.config.js
content: ['./index.html', './src/**/*.{js,jsx}']
```

### 3. React Router v6 Protected Routes Pattern

**Decision**: Use `<Outlet />` pattern with auth wrapper component

**Rationale**:
- v6's nested routes make protected route patterns cleaner
- Single auth check at route level, not per-component
- Enables layout composition with `<Outlet />`

**Pattern**:
```jsx
<Route element={<ProtectedRoute />}>
  <Route element={<Layout />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
</Route>
```

**Alternatives Considered**:
- HOC pattern: More verbose, harder to compose
- Per-component checks: Duplicated logic, easy to miss

### 4. Authentication State Management

**Decision**: React Context with useReducer for auth state

**Rationale**:
- Constitution prohibits Redux; Context + hooks is the standard
- useReducer provides predictable state transitions for auth flow
- Single source of truth for user/loading/error states

**State Shape**:
```js
{
  user: null | { id, github_username, email, avatar_url, is_admin },
  loading: boolean,
  error: string | null
}
```

**Alternatives Considered**:
- useState only: Works but harder to manage complex state transitions
- Zustand: Third-party dependency not in constitution stack

### 5. API Client with Cookie Credentials

**Decision**: Thin fetch wrapper with `credentials: 'include'`

**Rationale**:
- Constitution requires HTTP-only cookies, no localStorage
- Backend sets JWT in cookie; frontend just includes credentials
- Centralized error handling (401 → redirect to login)

**Pattern**:
```js
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
```

### 6. Error Handling for OAuth Flow

**Decision**: Query parameter-based error display on login page

**Rationale**:
- Backend redirects to `/login?error=cancelled` on OAuth failure
- Frontend parses query param and displays appropriate message
- No complex state needed; URL is the source of truth

**Error Messages**:
| Query Param | Display Message |
|-------------|-----------------|
| `?error=cancelled` | "Sign-in was cancelled. Please try again." |
| `?error=unavailable` | "Unable to connect. Please try again later." |
| `?error=cookies` | "Cookies are required for sign-in. Please enable cookies." |

### 7. Component Prop Validation

**Decision**: PropTypes for runtime validation (no TypeScript)

**Rationale**:
- Constitution allows PropTypes or TypeScript; PropTypes simpler for team
- Runtime warnings catch prop misuse during development
- No build step changes required

**Standard Pattern**:
```jsx
import PropTypes from 'prop-types';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  variant: 'primary',
  disabled: false,
};
```

### 8. Accessibility Implementation

**Decision**: Semantic HTML + Tailwind focus utilities + ARIA where needed

**Rationale**:
- Native elements (button, input, nav) provide accessibility for free
- Tailwind's `focus:ring-*` utilities for visible focus indicators
- ARIA only when semantic HTML insufficient (e.g., dropdown menus)

**Key Patterns**:
- `<button>` for clickable actions (not `<div onClick>`)
- `<nav>` for navigation regions
- `role="menu"` and `role="menuitem"` for dropdown
- `aria-expanded` for toggle states
- `aria-live="polite"` for loading/error announcements

### 9. Environment Configuration

**Decision**: Vite's `import.meta.env` with `.env` files

**Rationale**:
- Vite requires `VITE_` prefix for client-exposed variables
- Prevents accidental exposure of server-only secrets
- `.env.example` documents required variables

**Variables**:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### 10. Testing Strategy

**Decision**: Vitest (unit) + React Testing Library (component) + Playwright (E2E)

**Rationale**:
- Vitest integrates seamlessly with Vite
- RTL encourages testing user behavior, not implementation
- Playwright for critical auth flow E2E tests

**Test Coverage**:
| Layer | Tools | What to Test |
|-------|-------|--------------|
| Unit | Vitest | Hooks (useAuth), utilities |
| Component | RTL | Button, Spinner, LoginPage render |
| Integration | RTL | AuthContext + ProtectedRoute |
| E2E | Playwright | Full login/logout flow |

## Resolved Unknowns

All technical decisions made. No NEEDS CLARIFICATION items remain.

## Next Steps

Proceed to Phase 1: Design & Contracts

# Stage 1: Foundation & Authentication

**Status**: Not Started
**Priority**: P0 (Critical Path)
**Estimated Scope**: Project setup + core infrastructure
**Dependencies**: None (first stage)

## Objective

Establish the project foundation with routing, authentication, and layout components. At the end of this stage, users can sign in via GitHub OAuth and see a basic authenticated shell.

## Deliverables

### 1.1 Project Setup

| Task | Description | Files |
|------|-------------|-------|
| Initialize Vite + React | Create project with Vite, React 18 | `package.json`, `vite.config.js` |
| Configure Tailwind CSS | Install and configure Tailwind | `tailwind.config.js`, `postcss.config.js`, `src/index.css` |
| Configure React Router | Setup routing infrastructure | `src/App.jsx` |
| Configure ESLint | Linting rules for React | `.eslintrc.cjs` |
| Environment config | API URL configuration | `.env.example`, `.env` |

### 1.2 API Client

| Task | Description | Files |
|------|-------------|-------|
| Base API client | Fetch wrapper with credentials, error handling | `src/api/client.js` |
| Auth API module | Login redirect, logout, get current user | `src/api/auth.js` |

**Requirements from PRD**:
- Include `credentials: 'include'` for cookies
- Set `Content-Type: application/json`
- Handle 401 by redirecting to login

### 1.3 Authentication

| Task | Description | Files | PRD Ref |
|------|-------------|-------|---------|
| Auth Context | User state, loading, login/logout methods | `src/contexts/AuthContext.jsx` | FE-AUTH-03 |
| useAuth hook | Context consumer hook | `src/hooks/useAuth.js` | - |
| Login Page | GitHub sign-in button | `src/pages/LoginPage.jsx` | FE-AUTH-01 |
| OAuth redirect | Handle redirect to backend OAuth | `src/api/auth.js` | FE-AUTH-01 |
| Logout | Clear state, call API, redirect | `src/contexts/AuthContext.jsx` | FE-AUTH-04 |

### 1.4 Layout & Navigation

| Task | Description | Files |
|------|-------------|-------|
| Layout component | Header + main content area | `src/components/layout/Layout.jsx` |
| Header | Logo, user avatar, dropdown menu | `src/components/layout/Header.jsx` |
| UserMenu | Avatar, username, logout option | `src/components/layout/UserMenu.jsx` |
| ProtectedRoute | Auth guard, redirect to login | `src/components/common/ProtectedRoute.jsx` |

**Requirements from PRD**:
- Display user avatar in header (FE-AUTH-02)
- Display username next to avatar (FE-AUTH-02)
- Dropdown menu with logout option (FE-AUTH-04)

### 1.5 Routing Structure

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<Layout />}>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Placeholder />} />
    </Route>
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 1.6 Common Components

| Task | Description | Files |
|------|-------------|-------|
| Button | Primary, secondary, danger variants | `src/components/common/Button.jsx` |
| Spinner | Loading indicator | `src/components/common/Spinner.jsx` |
| NotFound | 404 page | `src/pages/NotFound.jsx` |

## Acceptance Criteria

- [ ] `npm run dev` starts development server at localhost:5173
- [ ] Clicking "Sign in with GitHub" redirects to backend OAuth endpoint
- [ ] After OAuth callback, user sees authenticated layout with their avatar
- [ ] Clicking logout clears session and redirects to login
- [ ] Unauthenticated users accessing `/dashboard` are redirected to `/login`
- [ ] 404 page displays for unknown routes

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Component-First | Layout, Header, Button as reusable components |
| II. Accessibility | Focus indicators on buttons, semantic HTML |
| III. Mobile-First | Responsive header, touch-friendly buttons |
| IV. Security | HTTP-only cookies, no localStorage tokens |
| V. Type Safety | PropTypes on all components |

## Testing Checklist

- [ ] Login page renders sign-in button
- [ ] Auth context provides user state
- [ ] Protected route redirects when unauthenticated
- [ ] API client includes credentials
- [ ] Logout clears auth state

## Files Created

```
src/
├── api/
│   ├── client.js
│   └── auth.js
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Spinner.jsx
│   │   └── ProtectedRoute.jsx
│   └── layout/
│       ├── Layout.jsx
│       ├── Header.jsx
│       └── UserMenu.jsx
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   └── useAuth.js
├── pages/
│   ├── LoginPage.jsx
│   └── NotFound.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Next Stage

Upon completion, proceed to **Stage 2: Question Components & Survey Form**.

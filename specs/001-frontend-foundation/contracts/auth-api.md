# Auth API Contract (Frontend Perspective)

**Feature**: 001-frontend-foundation
**Date**: 2026-01-18
**Base URL**: `${VITE_API_URL}` (e.g., `http://localhost:8000/api/v1`)

## Overview

This document defines the API contract from the frontend's perspective. The backend implements these endpoints; the frontend consumes them.

## Endpoints

### 1. Initiate GitHub OAuth

**Request**:
```
GET /auth/github
```

**Behavior**:
- Frontend redirects browser to this URL
- Backend redirects to GitHub OAuth authorization page
- After GitHub auth, backend redirects to callback, then to frontend

**Frontend Usage**:
```js
const login = () => {
  window.location.href = `${API_URL}/auth/github`;
};
```

**Success**: Browser redirected to GitHub, then back to app with session cookie set.

**Failure Redirect**: Backend redirects to `/login?error=cancelled` or `/login?error=unavailable`

---

### 2. Get Current User

**Request**:
```
GET /auth/me
Headers:
  Cookie: surveyflow_token=<jwt> (sent automatically with credentials: include)
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "github_id": 12345678,
  "github_username": "johndoe",
  "email": "john@example.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345678",
  "is_admin": false,
  "created_at": "2026-01-15T10:30:00Z",
  "last_login_at": "2026-01-18T08:00:00Z"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

**Frontend Usage**:
```js
const fetchUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error('Failed to fetch user');
  }
  return response.json();
};
```

---

### 3. Logout

**Request**:
```
POST /auth/logout
Headers:
  Cookie: surveyflow_token=<jwt>
```

**Success Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Behavior**:
- Backend clears the session cookie
- Frontend clears auth context state
- Frontend redirects to login page

**Frontend Usage**:
```js
const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  // Clear local state and redirect
  setUser(null);
  navigate('/login');
};
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| 200 | Success | Process response |
| 401 | Not authenticated | Redirect to login |
| 403 | Forbidden | Show permission error |
| 500 | Server error | Show "Unable to connect" message |
| Network error | Backend unreachable | Show "Unable to connect" message |

### Error Response Format

```json
{
  "detail": "Human-readable error message"
}
```

## Cookie Configuration (Backend Responsibility)

The backend sets the authentication cookie with these attributes:

| Attribute | Value | Purpose |
|-----------|-------|---------|
| Name | `surveyflow_token` | Session identifier |
| HttpOnly | true | Prevent XSS access |
| Secure | true (production) | HTTPS only |
| SameSite | Lax | CSRF protection |
| Path | / | Available site-wide |

## Type Definitions

```typescript
// For documentation purposes (frontend uses PropTypes)

interface User {
  id: string;           // UUID
  github_id: number;
  github_username: string;
  email: string | null;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;   // ISO datetime
  last_login_at: string; // ISO datetime
}

interface AuthError {
  detail: string;
}
```

## Sequence Diagrams

### Login Flow

```
User        Frontend         Backend          GitHub
 |              |                |                |
 |--[click login]-->            |                |
 |              |--[redirect]-->|                |
 |              |               |--[redirect]--->|
 |              |               |<--[auth code]--|
 |              |               |--[exchange]--->|
 |              |               |<--[user info]--|
 |              |<--[redirect + cookie]--|       |
 |<--[show dashboard]--|        |                |
```

### Auth Check on Page Load

```
User        Frontend         Backend
 |              |                |
 |--[visit /dashboard]->        |
 |              |--[GET /auth/me]-->
 |              |<--[200 + user]--|
 |<--[show dashboard]--|        |
```

### Logout Flow

```
User        Frontend         Backend
 |              |                |
 |--[click logout]-->           |
 |              |--[POST /auth/logout]->
 |              |<--[200 + clear cookie]|
 |              |--[clear state]|        |
 |<--[redirect to login]|       |
```

# Data Model: Frontend Foundation & Authentication

**Feature**: 001-frontend-foundation
**Date**: 2026-01-18

## Entities

### User (from Backend API)

Represents an authenticated user retrieved from the backend.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | UUID | Unique identifier | Backend |
| github_id | number | GitHub user ID | Backend |
| github_username | string | GitHub login name | Backend |
| email | string \| null | User's email (may be private) | Backend |
| avatar_url | string | GitHub avatar URL | Backend |
| is_admin | boolean | Admin privileges flag | Backend |
| created_at | ISO datetime | Account creation time | Backend |
| last_login_at | ISO datetime | Last authentication time | Backend |

**Note**: Frontend does not persist User data. It's fetched on app load via `/auth/me` and stored in React Context.

### AuthState (Frontend State)

React Context state shape for authentication.

| Field | Type | Description |
|-------|------|-------------|
| user | User \| null | Current authenticated user |
| loading | boolean | True while checking auth status |
| error | string \| null | Error message if auth failed |

**State Transitions**:

```
Initial → Loading (on mount)
Loading → Authenticated (user found)
Loading → Unauthenticated (no user/401)
Loading → Error (network/server error)
Authenticated → Unauthenticated (on logout)
```

### ErrorState (Login Page)

Query parameter-based error display.

| Query Param | Error Type | Display Message |
|-------------|------------|-----------------|
| `cancelled` | OAuth cancelled | "Sign-in was cancelled. Please try again." |
| `unavailable` | Backend error | "Unable to connect. Please try again later." |
| `cookies` | Cookies disabled | "Cookies are required for sign-in. Please enable cookies." |
| (none) | No error | (no message shown) |

## Component Props

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | node | required | Button content |
| variant | 'primary' \| 'secondary' \| 'danger' | 'primary' | Visual style |
| onClick | function | undefined | Click handler |
| disabled | boolean | false | Disabled state |
| type | 'button' \| 'submit' | 'button' | HTML button type |
| className | string | '' | Additional CSS classes |

### Spinner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | 'md' | Spinner size |
| className | string | '' | Additional CSS classes |

### ProtectedRoute

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| adminOnly | boolean | false | Require admin privileges |

**Behavior**:
- If loading: render Spinner
- If not authenticated: redirect to `/login`
- If adminOnly and !user.is_admin: redirect to `/`
- Otherwise: render `<Outlet />`

### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| (none) | - | - | Renders Header + Outlet |

### Header

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| (none) | - | - | Uses useAuth() for user data |

### UserMenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| user | User | required | User object for display |
| onLogout | function | required | Logout handler |

### LoginPage

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| (none) | - | - | Reads error from URL query params |

### NotFound

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| (none) | - | - | Static 404 page |

## Validation Rules

### User Validation (from API response)

```js
// Required fields
user.id         // must be valid UUID string
user.github_username  // must be non-empty string
user.avatar_url      // must be valid URL string
user.is_admin        // must be boolean

// Optional fields
user.email           // string or null
```

### Auth State Invariants

1. If `loading === true`, `user` and `error` SHOULD be from previous state
2. If `user !== null`, user MUST have valid required fields
3. `loading` and `error` are mutually exclusive (error clears loading)

## Relationships

```
AuthContext
    └── provides → { user, loading, error, login, logout }
            │
            ├── consumed by → ProtectedRoute (auth check)
            ├── consumed by → Header (user display)
            └── consumed by → UserMenu (user display + logout)

Layout
    └── contains → Header
                      └── contains → UserMenu

ProtectedRoute
    └── wraps → Layout
                   └── wraps → (protected pages via Outlet)
```

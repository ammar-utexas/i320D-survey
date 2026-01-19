# Quickstart: Frontend Foundation & Authentication

**Feature**: 001-frontend-foundation
**Date**: 2026-01-18

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Backend running at `http://localhost:8000` (or update `.env`)
- GitHub OAuth app configured (backend responsibility)

## Setup

### 1. Create Project

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
```

### 2. Install Dependencies

```bash
npm install react-router-dom@6 prop-types
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind

**tailwind.config.js**:
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Environment Variables

Create `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

Create `.env.example`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

## Development

### Start Dev Server

```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in dist/
```

### Preview Production Build

```bash
npm run preview
```

## File Structure After Setup

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   └── auth.js
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
├── .env
├── .env.example
├── .eslintrc.cjs
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Key Implementation Patterns

### API Client (src/api/client.js)

```js
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}
```

### Auth Context (src/contexts/AuthContext.jsx)

```jsx
import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch((err) => {
        if (err.message !== 'Unauthorized') {
          setError('Failed to connect');
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Route (src/components/common/ProtectedRoute.jsx)

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

## Testing Commands

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e
```

## Verification Checklist

After setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] Visiting `/` redirects to `/login` (when not authenticated)
- [ ] "Sign in with GitHub" button redirects to backend OAuth
- [ ] After OAuth, user sees dashboard with avatar
- [ ] Clicking logout returns to login page
- [ ] Visiting `/nonexistent` shows 404 page
- [ ] All buttons have visible focus rings on Tab

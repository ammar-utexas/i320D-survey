# Frontend - React/Vite Application

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Fetch API (with credentials for cookies)
- **State:** React Context + hooks

## Project Structure

```
frontend/
├── src/
│   ├── api/                 # API client functions
│   │   ├── client.js        # Base fetch wrapper
│   │   ├── auth.js          # Auth endpoints
│   │   ├── surveys.js       # Survey endpoints
│   │   └── responses.js     # Response endpoints
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Buttons, inputs, modals
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── survey/          # Survey-specific components
│   │   │   ├── QuestionRenderer.jsx
│   │   │   ├── ScaleQuestion.jsx
│   │   │   ├── SingleChoiceQuestion.jsx
│   │   │   ├── MultiCheckboxQuestion.jsx
│   │   │   ├── DropdownQuestion.jsx
│   │   │   ├── SingleChoiceWithTextQuestion.jsx
│   │   │   ├── OpenTextQuestion.jsx
│   │   │   └── SurveyForm.jsx
│   │   └── admin/           # Admin dashboard components
│   │       ├── SurveyCard.jsx
│   │       ├── SurveyList.jsx
│   │       └── ResponseTable.jsx
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.jsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useSurvey.js
│   │   └── useAutoSave.js
│   ├── pages/               # Route pages
│   │   ├── LoginPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── SurveyCreate.jsx
│   │   ├── SurveyRespond.jsx
│   │   ├── SurveyResults.jsx
│   │   └── NotFound.jsx
│   ├── utils/               # Helper functions
│   │   ├── validation.js
│   │   └── formatters.js
│   ├── App.jsx              # Root component with routes
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind imports
├── public/
│   └── favicon.ico
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

## Coding Conventions

### File Naming

- React components: `PascalCase.jsx` (e.g., `SurveyForm.jsx`)
- Hooks: `useCamelCase.js` (e.g., `useAuth.js`)
- Utils/helpers: `camelCase.js` (e.g., `validation.js`)
- API modules: `camelCase.js` (e.g., `surveys.js`)
- Contexts: `PascalCase.jsx` (e.g., `AuthContext.jsx`)

**Note:** Use `.jsx` for files containing JSX, `.js` for pure JavaScript modules.

### Component Structure

```jsx
// components/survey/QuestionRenderer.jsx
import { useState } from 'react';
import ScaleQuestion from './ScaleQuestion';
import SingleChoiceQuestion from './SingleChoiceQuestion';
// ... other imports

const questionComponents = {
  scale_1_5: ScaleQuestion,
  single_choice: SingleChoiceQuestion,
  multi_checkbox: MultiCheckboxQuestion,
  dropdown: DropdownQuestion,
  single_choice_with_text: SingleChoiceWithTextQuestion,
  open_text: OpenTextQuestion,
};

export default function QuestionRenderer({ question, value, onChange }) {
  const Component = questionComponents[question.type];

  if (!Component) {
    return <div>Unknown question type: {question.type}</div>;
  }

  return (
    <Component
      question={question}
      value={value}
      onChange={onChange}
    />
  );
}
```

### Props Pattern

```jsx
// Destructure props with defaults
export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
}) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}
```

### Hooks Pattern

```jsx
// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### API Client Pattern

```jsx
// api/client.js
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

// api/surveys.js
import { apiRequest } from './client';

// Admin endpoints use UUID `id`
export const surveysApi = {
  list: () => apiRequest('/surveys'),
  get: (id) => apiRequest(`/surveys/${id}`),
  create: (data) => apiRequest('/surveys', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/surveys/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiRequest(`/surveys/${id}`, { method: 'DELETE' }),
  duplicate: (id) => apiRequest(`/surveys/${id}/duplicate`, { method: 'POST' }),
  getResponses: (id) => apiRequest(`/surveys/${id}/responses`),
  export: (id, format) => apiRequest(`/surveys/${id}/export?format=${format}`),
};

// api/responses.js - Public endpoints use `slug`
export const responsesApi = {
  getSurvey: (slug) => apiRequest(`/surveys/${slug}/public`),
  submit: (slug, data) => apiRequest(`/surveys/${slug}/respond`, { method: 'POST', body: data }),
  getMyResponse: (slug) => apiRequest(`/surveys/${slug}/my-response`),
};
```

### Context Pattern

```jsx
// contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => setUser(null))
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Tailwind Conventions

### Responsive Design

```jsx
// Mobile-first approach
<div className="
  w-full              // Mobile: full width
  md:w-1/2            // Tablet: half width
  lg:w-1/3            // Desktop: third width
">
```

### Common Patterns

```jsx
// Card
<div className="bg-white rounded-lg shadow p-6">

// Form input
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Section heading
<h2 className="text-xl font-semibold text-gray-900 mb-4">

// Muted text
<p className="text-sm text-gray-500">

// Button group
<div className="flex gap-2">
```

### Survey-Specific Styles

```jsx
// Vector/section container
<section className="bg-white rounded-lg shadow mb-6">
  <div className="bg-gray-50 px-6 py-4 border-b">
    <h3 className="text-lg font-medium">{vector.vector_name}</h3>
  </div>
  <div className="p-6 space-y-6">
    {/* Questions */}
  </div>
</section>

// Scale buttons (1-5)
<div className="flex justify-between gap-2">
  {[1, 2, 3, 4, 5].map((n) => (
    <button
      key={n}
      onClick={() => onChange(n)}
      className={`
        flex-1 py-2 rounded border transition-colors
        ${value === n
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
        }
      `}
    >
      {n}
    </button>
  ))}
</div>

// Progress bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-blue-600 h-2 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

## Routing

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SurveyRespond from './pages/SurveyRespond';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/s/:slug" element={<SurveyRespond />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/surveys/:id" element={<SurveyResults />} />
              <Route path="/surveys/new" element={<SurveyCreate />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### Protected Route Pattern

```jsx
// components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
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

## Local Development

### Setup
```bash
cd frontend
npm install
```

### Environment Variables (.env)
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Run Dev Server
```bash
npm run dev
```

Server runs at http://localhost:5173

### Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Deployment (Vercel)

### vercel.json
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Environment Variables (Vercel Dashboard)
```
VITE_API_URL=https://your-backend.railway.app/api/v1
```

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Format (if prettier configured)
npm run format
```

## Testing (Optional)

If using Vitest:

```bash
npm run test
npm run test:coverage
```

```jsx
// Example test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

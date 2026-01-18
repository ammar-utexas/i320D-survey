# Frontend Product Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| Product Name | SurveyFlow Frontend |
| Version | 1.0 |
| Parent Document | ../survey_platform_prd.md |
| Date | January 2026 |
| Status | Draft |

---

## 1. Overview

The SurveyFlow frontend is a React single-page application that provides the user interface for survey administration and response collection. It communicates with the backend API for all data operations and handles GitHub OAuth authentication flow.

---

## 2. Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Fetch API |
| State | React Context + hooks |
| Hosting | Vercel |

---

## 3. Requirements

### 3.1 Authentication (FE-AUTH)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FE-AUTH-01 | P0 | Display "Sign in with GitHub" button and redirect to backend OAuth | - Login page with prominent GitHub sign-in button<br>- Click redirects to backend /auth/github endpoint<br>- Handle OAuth callback redirect from backend |
| FE-AUTH-02 | P0 | Display user avatar and username after login | - Show user avatar in header<br>- Display username next to avatar<br>- Dropdown menu with user options |
| FE-AUTH-03 | P1 | Handle JWT authentication | - Include credentials in all API requests<br>- Redirect to login on 401 response<br>- Persist auth state across page refreshes |
| FE-AUTH-04 | P1 | Logout functionality | - Logout button in user dropdown<br>- Call backend logout endpoint<br>- Clear local auth state<br>- Redirect to login page |
| FE-AUTH-05 | P2 | Display organization restriction errors | - Show clear error message if login rejected<br>- Explain org membership requirement |

### 3.2 Survey Management - Admin (FE-ADMIN)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FE-ADMIN-01 | P0 | File upload for JSON survey configuration | - Drag-and-drop or click-to-upload area<br>- Accept .json files only<br>- Preview file name before upload<br>- Send to backend and handle response |
| FE-ADMIN-02 | P0 | Display validation errors from backend | - Show error messages clearly<br>- Highlight problematic fields if possible<br>- Allow re-upload after fixing |
| FE-ADMIN-03 | P0 | Display generated survey URL with copy button | - Show full URL after survey creation<br>- One-click copy to clipboard<br>- Visual feedback on copy success |
| FE-ADMIN-04 | P1 | Date/time pickers for open/close dates | - Date and time inputs for opens_at and closes_at<br>- Show current survey status (Open/Closed/Scheduled)<br>- Allow clearing dates |
| FE-ADMIN-05 | P1 | Respondents table with status | - Table columns: Avatar, Username, Email, Status, Submitted At<br>- Status mapping from backend `is_draft`: null response = "Not Started", is_draft=true = "In Progress", is_draft=false = "Completed"<br>- Pagination controls<br>- Search/filter by username |
| FE-ADMIN-06 | P1 | Export buttons for JSON and CSV | - Dropdown with format options<br>- Trigger browser download<br>- Show loading state during export |
| FE-ADMIN-07 | P2 | Inline edit for survey metadata | - Edit button on survey title/description<br>- Inline form or modal<br>- Save and Cancel buttons |
| FE-ADMIN-08 | P2 | Duplicate survey button | - Duplicate button on survey card<br>- Prompt for new survey title<br>- Navigate to new survey after creation |
| FE-ADMIN-09 | P2 | Delete survey with confirmation | - Delete button with trash icon<br>- Confirmation modal with survey title<br>- Remove from list after deletion |

### 3.3 Survey Rendering - Respondent (FE-RESP)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FE-RESP-01 | P0 | Render all question types with appropriate components | - QuestionRenderer dispatches to type-specific components<br>- ScaleQuestion: 5 clickable buttons with labels<br>- SingleChoiceQuestion: Radio button group<br>- MultiCheckboxQuestion: Checkbox group<br>- DropdownQuestion: Select element<br>- SingleChoiceWithTextQuestion: Radio + conditional textarea<br>- OpenTextQuestion: Textarea with character counter |
| FE-RESP-02 | P0 | Group questions by vector/section | - Card/section for each vector<br>- Vector name as section header<br>- Visual separation between sections<br>- Questions numbered within sections |
| FE-RESP-03 | P0 | Client-side validation before submission | - Highlight required fields not filled<br>- Show error messages next to fields<br>- Prevent form submission until valid<br>- Scroll to first error field |
| FE-RESP-04 | P1 | Auto-save responses as user progresses | - Debounced save (2 seconds after last change)<br>- Send `{ answers: {...}, is_draft: true }` for auto-save<br>- "Saving..." indicator during save<br>- "All changes saved" confirmation<br>- Handle offline/error gracefully |
| FE-RESP-05 | P1 | Load and display existing response for editing | - Fetch user's response on page load (returns null if none)<br>- Pre-fill form with saved answers<br>- Show "Submit Survey" if is_draft=true, "Update Response" if is_draft=false<br>- Last saved timestamp |
| FE-RESP-06 | P1 | Mobile-responsive design | - Responsive layout (mobile-first)<br>- Touch-friendly input sizes (min 44px tap targets)<br>- Stack sections vertically on mobile<br>- Readable text sizes |
| FE-RESP-07 | P2 | Progress indicator | - Progress bar at top of survey<br>- Show percentage (e.g., "60% complete")<br>- Calculate based on required questions answered<br>- Update in real-time |
| FE-RESP-08 | P2 | Keyboard navigation support | - Tab navigation between questions<br>- Enter/Space to select options<br>- Arrow keys for radio/scale questions<br>- Focus visible indicators |

### 3.4 Question Type Components (FE-QTYPE)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FE-QTYPE-01 | P0 | ScaleQuestion component (scale_1_5) | - 5 clickable buttons in a row<br>- Labels: "1" to "5" with "Low" and "High" at endpoints<br>- Selected state visually distinct<br>- Store integer value (1-5) |
| FE-QTYPE-02 | P0 | SingleChoiceQuestion component | - Radio button for each option<br>- Option text as label<br>- Only one selectable<br>- Store selected option string |
| FE-QTYPE-03 | P0 | MultiCheckboxQuestion component | - Checkbox for each option<br>- Option text as label<br>- Multiple selectable<br>- Store array of selected strings |
| FE-QTYPE-04 | P0 | DropdownQuestion component | - Select element with placeholder<br>- Options from question.options<br>- Store selected option string |
| FE-QTYPE-05 | P0 | SingleChoiceWithTextQuestion component | - Radio buttons for options<br>- Textarea appears when certain option selected (e.g., "Yes")<br>- text_prompt as textarea label<br>- Store {choice: string, text: string} |
| FE-QTYPE-06 | P0 | OpenTextQuestion component | - Textarea element<br>- maxLength=1000<br>- Character counter (e.g., "250/1000")<br>- Store string value |

### 3.5 Export UI (FE-EXPORT)

| Req ID | Priority | Description | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FE-EXPORT-01 | P0 | JSON export button | - Button labeled "Export JSON"<br>- Triggers download with .json extension<br>- Loading state during generation |
| FE-EXPORT-02 | P0 | CSV export button | - Button labeled "Export CSV"<br>- Triggers download with .csv extension<br>- Loading state during generation |
| FE-EXPORT-03 | P1 | N/A - Backend includes metadata | - Display metadata columns in preview if shown |
| FE-EXPORT-04 | P2 | Date range filter for export | - Date picker for start date<br>- Date picker for end date<br>- Pass dates to export API call |
| FE-EXPORT-05 | P2 | Anonymize export checkbox | - Checkbox "Anonymize responses"<br>- Pass flag to export API call |

---

## 4. Pages and Routes

| Route | Page | Auth Required | Description |
|-------|------|---------------|-------------|
| `/login` | LoginPage | No | GitHub sign-in button |
| `/` | Redirect | - | Redirects to /dashboard |
| `/dashboard` | AdminDashboard | Yes (Admin) | List of admin's surveys |
| `/surveys/new` | SurveyCreate | Yes (Admin) | Upload new survey |
| `/surveys/:id` | SurveyResults | Yes (Admin) | View responses and export |
| `/s/:slug` | SurveyRespond | Yes | Take survey (respondent view) |
| `*` | NotFound | No | 404 page |

---

## 5. Component Hierarchy

```
App
├── AuthProvider (context)
├── BrowserRouter
│   └── Routes
│       ├── LoginPage
│       ├── SurveyRespond
│       │   ├── SurveyForm
│       │   │   ├── SurveySection (per vector)
│       │   │   │   └── QuestionRenderer (per question)
│       │   │   │       ├── ScaleQuestion
│       │   │   │       ├── SingleChoiceQuestion
│       │   │   │       ├── MultiCheckboxQuestion
│       │   │   │       ├── DropdownQuestion
│       │   │   │       ├── SingleChoiceWithTextQuestion
│       │   │   │       └── OpenTextQuestion
│       │   │   └── ProgressBar
│       │   └── AutoSaveIndicator
│       ├── ProtectedRoute
│       │   └── Layout
│       │       ├── Header (with UserMenu)
│       │       └── Outlet
│       │           ├── AdminDashboard
│       │           │   ├── SurveyList
│       │           │   │   └── SurveyCard
│       │           │   └── CreateSurveyButton
│       │           ├── SurveyCreate
│       │           │   └── FileUpload
│       │           └── SurveyResults
│       │               ├── SurveyStats
│       │               ├── ResponseTable
│       │               └── ExportDropdown
│       └── NotFound
```

---

## 6. State Management

### 6.1 Auth Context

```jsx
const AuthContext = {
  user: User | null,
  loading: boolean,
  login: () => void,      // Redirect to OAuth
  logout: () => Promise,  // Call API, clear state
}
```

### 6.2 Survey Form State

```jsx
const SurveyFormState = {
  survey: Survey,           // Survey config from API
  answers: Record<string, any>,  // question_id -> answer
  errors: Record<string, string>, // question_id -> error
  saving: boolean,
  lastSaved: Date | null,
}
```

---

## 7. API Integration

### 7.1 API Client

All requests should:
- Include `credentials: 'include'` for cookies
- Set `Content-Type: application/json`
- Handle 401 by redirecting to login
- Handle errors and display to user

### 7.2 Endpoints Used

| Module | Endpoints |
|--------|-----------|
| Auth | GET /auth/github, POST /auth/logout, GET /auth/me |
| Surveys | GET/POST /surveys, GET/PATCH/DELETE /surveys/:id, POST /surveys/:id/duplicate |
| Responses | GET /surveys/:slug/public, POST /surveys/:slug/respond, GET /surveys/:slug/my-response |
| Export | GET /surveys/:id/export?format=json\|csv |

### 7.3 Request/Response Schemas

**Submit Response (POST /surveys/:slug/respond)**
```json
{
  "answers": {
    "Q1": 3,
    "Q2": "Option A",
    "Q3": ["Option 1", "Option 2"],
    "Q4": { "choice": "Yes", "text": "Details here" }
  },
  "is_draft": true
}
```
- `is_draft: true` - Auto-save (can be updated later)
- `is_draft: false` - Final submission (sets submitted_at)

**Response Data (returned from POST and GET my-response)**
```json
{
  "answers": { ... },
  "is_draft": true,
  "submitted_at": null,
  "updated_at": "2026-01-18T12:00:00Z"
}
```
Note: GET my-response returns `null` (not 404) if no response exists.

---

## 8. UI/UX Requirements

### 8.1 Design System

| Element | Specification |
|---------|---------------|
| Primary color | Blue (#2563EB) |
| Error color | Red (#DC2626) |
| Success color | Green (#16A34A) |
| Font | System font stack |
| Border radius | 0.375rem (rounded-md) |
| Shadows | Tailwind shadow-sm, shadow |

### 8.2 Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |

### 8.3 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | WCAG AA minimum (4.5:1) |
| Focus indicators | Visible focus rings on all interactive elements |
| Form labels | All inputs have associated labels |
| Error messages | Announced to screen readers |
| Keyboard navigation | All functionality keyboard accessible |

---

## 9. Wireframes

### 9.1 Login Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                       SurveyFlow                            │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │   Sign in with GitHub       │                │
│              └─────────────────────────────┘                │
│                                                             │
│           Secure authentication via GitHub OAuth            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  SurveyFlow                        [avatar] johndoe ▼       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  My Surveys                          [+ Create Survey]      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Student Pairing Survey                    [Open]      │  │
│  │ 24/30 responses · Closes Jan 25, 2026                 │  │
│  │ [View Responses] [Export ▼] [Edit] [Delete]           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Team Feedback Q1                          [Closed]    │  │
│  │ 12/12 responses · Closed Jan 10, 2026                 │  │
│  │ [View Responses] [Export ▼] [Duplicate] [Delete]      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Survey Response Page

```
┌─────────────────────────────────────────────────────────────┐
│  Student Pairing Survey                   [avatar] jane     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This survey helps us understand your skills...             │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 40% complete        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Technical Skills & Background                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │ 1. Rate your comfort level with Python programming. * │  │
│  │                                                       │  │
│  │    [1]   [2]   [3]   [4]   [5]                        │  │
│  │    Low                   High                         │  │
│  │                                                       │  │
│  │ 2. What technical skill do you want to improve? *     │  │
│  │    ┌─────────────────────────────────────────────┐    │  │
│  │    │                                             │    │  │
│  │    │                                             │    │  │
│  │    └─────────────────────────────────────────────┘    │  │
│  │    125/1000 characters                                │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                     All changes saved ✓                     │
│                                                             │
│                          [Save Draft]  [Submit Survey]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Error States

| Scenario | Display |
|----------|---------|
| API error | Toast notification with error message |
| Validation error | Inline error below field, red border |
| Network offline | Banner "You're offline. Changes will save when reconnected." |
| Survey closed | Full-page message "This survey is closed" |
| Not authorized | Redirect to login |
| 404 | Not found page with link to dashboard |

---

## 11. Loading States

| Component | Loading State |
|-----------|---------------|
| Page load | Centered spinner |
| Form submit | Button shows spinner, disabled |
| Auto-save | Small "Saving..." text |
| Export | Button shows spinner |
| Table | Skeleton rows |

---

## 12. Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API base URL |

---

## 13. Deployment (Vercel)

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

---

## 14. Testing Requirements

| Test Type | Coverage |
|-----------|----------|
| Component tests | All question type components |
| Integration tests | Form submission flow |
| E2E tests | Login flow, survey completion |
| Accessibility tests | All pages pass axe-core |

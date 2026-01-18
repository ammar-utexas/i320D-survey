# Stage 4: Admin Dashboard Core

**Status**: Not Started
**Priority**: P0 (Critical Path)
**Estimated Scope**: Survey management for admins
**Dependencies**: Stage 1 (Foundation & Authentication)

## Objective

Build the admin dashboard where educators can create surveys, view their survey list, and see response counts. At the end of this stage, admins can upload JSON survey configs and share survey URLs with respondents.

## Deliverables

### 4.1 Admin Route Protection

**File**: Updates to `ProtectedRoute.jsx`, `App.jsx`

Add admin-only route protection:
```jsx
<Route element={<ProtectedRoute adminOnly />}>
  <Route path="/dashboard" element={<AdminDashboard />} />
  <Route path="/surveys/new" element={<SurveyCreate />} />
  <Route path="/surveys/:id" element={<SurveyResults />} />
</Route>
```

Check `user.is_admin` and redirect non-admins appropriately.

### 4.2 Surveys API Module (Admin)

**File**: `src/api/surveys.js` (extend)

```js
export const surveysApi = {
  // Existing
  getPublic: (slug) => apiRequest(`/surveys/${slug}/public`),

  // Admin endpoints
  list: () => apiRequest('/surveys'),
  get: (id) => apiRequest(`/surveys/${id}`),
  create: (config) => apiRequest('/surveys', {
    method: 'POST',
    body: config,
  }),
  getResponses: (id) => apiRequest(`/surveys/${id}/responses`),
};
```

### 4.3 Admin Dashboard Page

**File**: `src/pages/AdminDashboard.jsx`

**Requirements**:
- Page title "My Surveys"
- "Create Survey" button (top right)
- List of admin's surveys as cards
- Loading state while fetching
- Empty state if no surveys

**Layout** (from PRD wireframe):
```
┌─────────────────────────────────────────────────────────────┐
│  My Surveys                          [+ Create Survey]      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Survey Title                             [Status]     │  │
│  │ X/Y responses · Closes [date]                         │  │
│  │ [View Responses] [Export ▼] [Edit] [Delete]           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Survey Card Component

**File**: `src/components/admin/SurveyCard.jsx`

**Props**:
```jsx
{
  survey: {
    id, slug, title, description,
    opens_at, closes_at,
    response_count, // from API
    created_at
  },
  onEdit, onDelete, onExport
}
```

**Display**:
- Survey title (clickable, links to results)
- Response count: "X responses" or "X/Y responses" if target known
- Status badge: Open (green), Closed (gray), Scheduled (yellow)
- Dates: "Closes Jan 25, 2026" or "Closed Jan 10, 2026"
- Action buttons (View, Export dropdown, Edit, Delete)

**Status logic**:
```js
function getSurveyStatus(survey) {
  const now = new Date();
  if (survey.closes_at && new Date(survey.closes_at) < now) return 'closed';
  if (survey.opens_at && new Date(survey.opens_at) > now) return 'scheduled';
  return 'open';
}
```

### 4.5 Survey List Component

**File**: `src/components/admin/SurveyList.jsx`

- Maps surveys to SurveyCard components
- Handles empty state: "No surveys yet. Create your first survey!"
- Loading skeleton while fetching

### 4.6 Survey Create Page

**File**: `src/pages/SurveyCreate.jsx`

**Requirements** (FE-ADMIN-01, FE-ADMIN-02, FE-ADMIN-03):
- File upload area for JSON config
- Validation error display
- Success: show generated URL with copy button

### 4.7 File Upload Component

**File**: `src/components/admin/FileUpload.jsx`

**Requirements** (FE-ADMIN-01):
- Drag-and-drop or click-to-upload area
- Accept `.json` files only
- Preview file name before upload
- Upload button to confirm
- Loading state during upload

```jsx
<FileUpload
  accept=".json"
  onFileSelect={(file) => setSelectedFile(file)}
  onUpload={handleUpload}
  loading={uploading}
/>
```

**Visual states**:
1. Empty: Dashed border, "Drag & drop JSON file or click to browse"
2. File selected: Show filename, "Upload" button enabled
3. Uploading: Spinner, "Uploading..."
4. Error: Red border, error message

### 4.8 Validation Error Display

**File**: `src/components/admin/ValidationErrors.jsx`

**Requirements** (FE-ADMIN-02):
- List validation errors from backend
- Clear formatting for each error
- Allow re-upload after fixing

```jsx
<ValidationErrors errors={[
  "vectors[0].questions[2]: missing required field 'question_id'",
  "vectors[1].vector_id: must be unique"
]} />
```

### 4.9 Survey URL Display

**File**: `src/components/admin/SurveyUrlDisplay.jsx`

**Requirements** (FE-ADMIN-03):
- Show full URL after survey creation
- Copy button with click-to-copy
- Visual feedback on copy success ("Copied!")

```jsx
<SurveyUrlDisplay
  url="https://surveyflow.app/s/student-pairing-2026"
  onCopy={() => navigator.clipboard.writeText(url)}
/>
```

### 4.10 Survey Results Page (Basic)

**File**: `src/pages/SurveyResults.jsx`

Basic version for this stage:
- Survey title and description
- Response count
- Survey URL with copy button
- Placeholder for response table (Stage 5)
- Placeholder for export (Stage 5)

### 4.11 Date Pickers for Survey Schedule

**File**: `src/components/admin/DateTimePicker.jsx`

**Requirements** (FE-ADMIN-04):
- Date and time inputs for `opens_at` and `closes_at`
- Show current survey status
- Allow clearing dates (make survey always open)

Note: Use native `<input type="datetime-local">` for simplicity, or a library if needed.

### 4.12 Common Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| StatusBadge | `src/components/admin/StatusBadge.jsx` | Open/Closed/Scheduled pill |
| CopyButton | `src/components/common/CopyButton.jsx` | Copy to clipboard with feedback |
| EmptyState | `src/components/common/EmptyState.jsx` | No data placeholder |

## Acceptance Criteria

- [ ] Admin dashboard shows list of admin's surveys
- [ ] Survey cards display title, status, response count
- [ ] "Create Survey" navigates to upload page
- [ ] JSON file can be uploaded via drag-drop or click
- [ ] Validation errors from backend display clearly
- [ ] Successful creation shows survey URL
- [ ] Copy button copies URL to clipboard
- [ ] Survey results page shows basic survey info
- [ ] Non-admin users cannot access admin routes

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Component-First | SurveyCard, FileUpload, StatusBadge reusable |
| II. Accessibility | File input accessible, status badges have text not just color |
| III. Mobile-First | Cards stack on mobile, touch-friendly upload area |
| IV. Security | Admin routes protected, file type validation |
| V. Type Safety | PropTypes on all admin components |

## Testing Checklist

- [ ] Dashboard fetches and displays surveys
- [ ] Empty state shows when no surveys
- [ ] File upload accepts only JSON
- [ ] Validation errors render correctly
- [ ] Survey URL copies to clipboard
- [ ] Status badges show correct state
- [ ] Admin route redirects non-admins

## Files Created

```
src/
├── api/
│   └── surveys.js (extended)
├── components/
│   ├── admin/
│   │   ├── SurveyCard.jsx
│   │   ├── SurveyList.jsx
│   │   ├── FileUpload.jsx
│   │   ├── ValidationErrors.jsx
│   │   ├── SurveyUrlDisplay.jsx
│   │   ├── StatusBadge.jsx
│   │   └── DateTimePicker.jsx
│   └── common/
│       ├── CopyButton.jsx
│       └── EmptyState.jsx
└── pages/
    ├── AdminDashboard.jsx
    ├── SurveyCreate.jsx
    └── SurveyResults.jsx
```

## Next Stage

Upon completion, proceed to **Stage 5: Admin Advanced Features** (export, edit, delete, response table).

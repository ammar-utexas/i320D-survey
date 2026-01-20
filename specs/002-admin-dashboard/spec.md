# Stage 002: Survey Admin Dashboard - Feature Specification

## Document Information

| Field | Value |
|-------|-------|
| Feature | Survey Admin Dashboard |
| Stage | 002 |
| Version | 1.0 |
| Date | January 2026 |
| Status | Draft |
| Dependencies | Stage 001 (Frontend Foundation) |

---

## 1. Overview

The Survey Admin Dashboard provides authenticated administrators with the ability to create, manage, and analyze surveys. This stage implements the core admin workflow: uploading survey JSON configurations, viewing survey lists, managing survey metadata, viewing respondent data, and exporting responses.

### 1.1 Goals

- Enable admins to create surveys by uploading JSON configuration files
- Provide a dashboard view of all surveys owned by the admin
- Allow viewing and managing respondent data for each survey
- Support exporting survey responses in JSON and CSV formats
- Enable survey lifecycle management (scheduling, deletion)

### 1.2 Non-Goals (This Stage)

- Survey JSON editor/builder UI (JSON upload only)
- Real-time collaboration between admins
- Survey templates or marketplace
- Advanced analytics or visualization

---

## 2. User Stories

### 2.1 Survey Creation (P0)

**US-001: Upload Survey JSON**
> As an admin, I want to upload a JSON file containing my survey configuration so that I can create a new survey quickly.

**Acceptance Criteria:**
- [ ] Drag-and-drop zone accepts .json files only
- [ ] Click-to-browse fallback for file selection
- [ ] File name and size displayed before upload
- [ ] Validation errors from backend displayed clearly
- [ ] Success state shows generated survey URL
- [ ] One-click copy button for survey URL
- [ ] Visual feedback on successful copy

### 2.2 Dashboard View (P0)

**US-002: View My Surveys**
> As an admin, I want to see a list of all surveys I've created so that I can manage them.

**Acceptance Criteria:**
- [ ] Dashboard displays all surveys created by current user
- [ ] Each survey card shows: title, status, response count, dates
- [ ] Survey status derived from opens_at/closes_at: "Scheduled", "Open", "Closed"
- [ ] Empty state with call-to-action when no surveys exist
- [ ] Loading state while fetching surveys
- [ ] Error state with retry option on fetch failure

### 2.3 Survey URL Sharing (P0)

**US-003: Copy Survey URL**
> As an admin, I want to easily copy the survey URL to share with respondents.

**Acceptance Criteria:**
- [ ] Survey URL displayed on survey card
- [ ] Copy button adjacent to URL
- [ ] Visual feedback (tooltip/toast) on successful copy
- [ ] URL format: `{FRONTEND_URL}/s/{slug}`

### 2.4 View Responses (P1)

**US-004: View Survey Respondents**
> As an admin, I want to see who has responded to my survey and their response status.

**Acceptance Criteria:**
- [ ] Respondents table with columns: Avatar, Username, Email, Status, Submitted At
- [ ] Status mapping: null response = "Not Started", is_draft=true = "In Progress", is_draft=false = "Completed"
- [ ] Pagination controls (10/25/50 per page)
- [ ] Search/filter by username
- [ ] Loading state while fetching responses
- [ ] Empty state when no responses exist

### 2.5 Schedule Survey (P1)

**US-005: Set Survey Schedule**
> As an admin, I want to set open and close dates for my survey so that responses are only accepted during a specific window.

**Acceptance Criteria:**
- [ ] Date/time picker for opens_at
- [ ] Date/time picker for closes_at
- [ ] Clear button to remove dates (make survey always open)
- [ ] Validation: closes_at must be after opens_at
- [ ] Save button with loading state
- [ ] Success feedback on update

### 2.6 Export Responses (P1)

**US-006: Export Survey Data**
> As an admin, I want to export survey responses in different formats for analysis.

**Acceptance Criteria:**
- [ ] Export dropdown with JSON and CSV options
- [ ] Loading state during export generation
- [ ] Browser download triggered on completion
- [ ] Filename format: `{survey_slug}_responses_{timestamp}.{format}`

### 2.7 Duplicate Survey (P2)

**US-007: Duplicate Survey**
> As an admin, I want to duplicate an existing survey to create a similar one without re-uploading JSON.

**Acceptance Criteria:**
- [ ] Duplicate button on survey card
- [ ] Modal prompt for new survey title
- [ ] API call to POST /surveys/{id}/duplicate
- [ ] Navigate to new survey on success
- [ ] Error handling for failed duplication

### 2.8 Delete Survey (P2)

**US-008: Delete Survey**
> As an admin, I want to delete surveys I no longer need.

**Acceptance Criteria:**
- [ ] Delete button on survey card (trash icon)
- [ ] Confirmation modal with survey title
- [ ] Warning about data being unrecoverable
- [ ] Remove from list on successful deletion
- [ ] Error handling for failed deletion

### 2.9 Edit Survey Metadata (P2)

**US-009: Edit Survey Title/Description**
> As an admin, I want to edit the title and description of my survey without re-uploading the JSON.

**Acceptance Criteria:**
- [ ] Edit button on survey card or details page
- [ ] Inline edit or modal form
- [ ] Save and Cancel buttons
- [ ] Validation for required fields
- [ ] Success feedback on update

---

## 3. Component Architecture

### 3.1 Page Components

```
src/pages/
├── AdminDashboard.jsx    # Main dashboard with survey list
├── SurveyCreate.jsx      # Upload new survey page
└── SurveyResults.jsx     # View responses and manage survey
```

### 3.2 Admin Components

```
src/components/admin/
├── SurveyCard.jsx        # Individual survey card in list
├── SurveyList.jsx        # Grid/list of SurveyCard components
├── FileUpload.jsx        # Drag-and-drop file upload component
├── SurveyUrlCopy.jsx     # URL display with copy button
├── ResponseTable.jsx     # Paginated table of respondents
├── ExportDropdown.jsx    # Export format selection dropdown
├── DateTimePicker.jsx    # Date/time input for scheduling
├── ConfirmModal.jsx      # Reusable confirmation dialog
└── SurveyStats.jsx       # Response statistics summary
```

### 3.3 Component Hierarchy

```
AdminDashboard
├── SurveyList
│   └── SurveyCard (multiple)
│       ├── SurveyUrlCopy
│       └── ExportDropdown
└── EmptyState (when no surveys)

SurveyCreate
├── FileUpload
├── ValidationErrors
└── SurveyUrlCopy (on success)

SurveyResults
├── SurveyStats
├── DateTimePicker (opens_at)
├── DateTimePicker (closes_at)
├── ResponseTable
├── ExportDropdown
└── ConfirmModal (for delete)
```

---

## 4. API Integration

### 4.1 New API Module

Create `src/api/surveys.js`:

```javascript
import { apiRequest } from './client';

export const surveysApi = {
  // List all surveys for current admin
  list: () => apiRequest('/surveys'),

  // Get single survey details
  get: (id) => apiRequest(`/surveys/${id}`),

  // Create survey from JSON config
  create: (config) => apiRequest('/surveys', {
    method: 'POST',
    body: config
  }),

  // Update survey metadata
  update: (id, data) => apiRequest(`/surveys/${id}`, {
    method: 'PATCH',
    body: data
  }),

  // Soft-delete survey
  delete: (id) => apiRequest(`/surveys/${id}`, {
    method: 'DELETE'
  }),

  // Duplicate survey
  duplicate: (id, newTitle) => apiRequest(`/surveys/${id}/duplicate`, {
    method: 'POST',
    body: { title: newTitle }
  }),

  // Get survey responses
  getResponses: (id, params) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/surveys/${id}/responses${query ? `?${query}` : ''}`);
  },

  // Export responses
  export: (id, format) => apiRequest(`/surveys/${id}/export?format=${format}`),
};
```

---

## 5. Routes

Update `src/App.jsx` to add new routes:

```jsx
<Route element={<ProtectedRoute />}>
  <Route element={<Layout />}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<AdminDashboard />} />
    <Route path="/surveys/new" element={<SurveyCreate />} />
    <Route path="/surveys/:id" element={<SurveyResults />} />
  </Route>
</Route>
```

---

## 6. Implementation Phases

### Phase 1: Core Dashboard (P0)

1. **API Module** - Create `src/api/surveys.js` with list, create, get methods
2. **AdminDashboard Page** - Replace placeholder Dashboard, survey list, cards, empty/loading/error states
3. **SurveyCreate Page** - FileUpload, JSON validation, validation errors, SurveyUrlCopy

### Phase 2: Survey Management (P1)

4. **SurveyResults Page** - Survey details, SurveyStats, DateTimePicker, ResponseTable, search/filter
5. **Export Functionality** - ExportDropdown, JSON/CSV downloads

### Phase 3: Advanced Features (P2)

6. **Survey Actions** - ConfirmModal, delete, duplicate, inline edit

---

## 7. File Structure

```
src/
├── api/
│   ├── client.js          # Existing
│   ├── auth.js            # Existing
│   └── surveys.js         # NEW
├── components/
│   ├── common/
│   │   ├── Button.jsx     # Existing
│   │   ├── Spinner.jsx    # Existing
│   │   ├── ProtectedRoute.jsx  # Existing
│   │   └── Modal.jsx      # NEW (for confirm dialogs)
│   ├── layout/            # Existing (from Stage 001)
│   └── admin/             # NEW
│       ├── SurveyCard.jsx
│       ├── SurveyList.jsx
│       ├── FileUpload.jsx
│       ├── SurveyUrlCopy.jsx
│       ├── ResponseTable.jsx
│       ├── ExportDropdown.jsx
│       ├── DateTimePicker.jsx
│       ├── SurveyStats.jsx
│       └── ConfirmModal.jsx
├── pages/
│   ├── LoginPage.jsx      # Existing
│   ├── NotFound.jsx       # Existing
│   ├── AdminDashboard.jsx # REPLACE Dashboard.jsx
│   ├── SurveyCreate.jsx   # NEW
│   └── SurveyResults.jsx  # NEW
└── utils/
    ├── formatters.js      # NEW (date formatting, etc.)
    └── clipboard.js       # NEW (copy to clipboard utility)
```

---

## 8. Success Criteria

### Phase 1 (P0) Complete When:
- [ ] Admin can upload a JSON file and create a survey
- [ ] Validation errors are displayed clearly
- [ ] Survey URL is shown and copyable after creation
- [ ] Dashboard shows list of all admin's surveys
- [ ] Each survey shows title, status, and response count

### Phase 2 (P1) Complete When:
- [ ] Admin can view detailed response information
- [ ] Response table shows user info and status
- [ ] Pagination and search work correctly
- [ ] Date/time pickers allow scheduling surveys
- [ ] Export buttons download JSON and CSV files

### Phase 3 (P2) Complete When:
- [ ] Admin can edit survey title/description
- [ ] Admin can duplicate a survey
- [ ] Admin can delete a survey with confirmation

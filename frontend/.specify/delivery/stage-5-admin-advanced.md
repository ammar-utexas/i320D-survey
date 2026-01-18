# Stage 5: Admin Advanced Features

**Status**: Not Started
**Priority**: P1-P2 (Enhancement)
**Estimated Scope**: Export, response viewing, survey management
**Dependencies**: Stage 4 (Admin Dashboard Core)

## Objective

Complete the admin experience with response viewing, data export, and full survey management (edit, delete, duplicate). At the end of this stage, admins have full control over their surveys and can export data for algorithmic processing.

## Deliverables

### 5.1 Response Table Component

**File**: `src/components/admin/ResponseTable.jsx`

**Requirements** (FE-ADMIN-05):
- Table columns: Avatar, Username, Email, Status, Submitted At
- Status values derived from `is_draft` field:
  - **Completed**: `is_draft: false` (has `submitted_at`)
  - **In Progress**: `is_draft: true` (draft saved but not submitted)
  - **Not Started**: No response record exists for user
- Pagination controls (limit, offset)
- Search/filter by username via `?search=` query param

**Props**:
```jsx
{
  responses: [...],
  loading: boolean,
  pagination: { page, totalPages, onPageChange },
  onSearch: (query) => void,
}
```

**Table structure**:
```
┌────────┬──────────────┬─────────────────────┬───────────┬─────────────────┐
│ Avatar │ Username     │ Email               │ Status    │ Submitted At    │
├────────┼──────────────┼─────────────────────┼───────────┼─────────────────┤
│ [img]  │ johndoe      │ john@example.com    │ Completed │ Jan 15, 2026    │
│ [img]  │ janesmith    │ jane@example.com    │ In Progress│ -              │
└────────┴──────────────┴─────────────────────┴───────────┴─────────────────┘
```

### 5.2 Pagination Component

**File**: `src/components/common/Pagination.jsx`

- Previous/Next buttons
- Page numbers with ellipsis for many pages
- Current page indicator
- Items per page selector (optional)

### 5.3 Search Input Component

**File**: `src/components/common/SearchInput.jsx`

- Debounced search input
- Search icon
- Clear button when has value
- Placeholder: "Search by username..."

### 5.4 Export Functionality

**Files**: `src/components/admin/ExportDropdown.jsx`, `src/api/surveys.js`

**Requirements** (FE-ADMIN-06, FE-EXPORT-01, FE-EXPORT-02):
- Dropdown with format options (JSON, CSV)
- Trigger browser download
- Show loading state during export

**API**:
```js
export: async (id, format) => {
  const response = await fetch(`${API_URL}/surveys/${id}/export?format=${format}`, {
    credentials: 'include',
  });
  const blob = await response.blob();
  // Trigger download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `survey-${id}-responses.${format}`;
  a.click();
}
```

### 5.5 Export Options (P2)

**File**: `src/components/admin/ExportOptions.jsx`

**Requirements** (FE-EXPORT-04, FE-EXPORT-05):
- Date range filter (start date, end date)
- Anonymize checkbox
- Pass options to export API

```jsx
<ExportOptions
  onExport={(format, options) => handleExport(format, options)}
/>
// options use backend parameter names:
// { from_date: 'YYYY-MM-DD', to_date: 'YYYY-MM-DD', anonymize: boolean }
```

**Note**: Backend uses snake_case parameter names (`from_date`, `to_date`), not camelCase.

### 5.6 Survey Edit Functionality

**Files**: `src/components/admin/SurveyEditModal.jsx`, updates to `SurveyCard.jsx`

**Requirements** (FE-ADMIN-07):
- Edit button on survey card
- Modal with editable fields: title, description, opens_at, closes_at
- Save and Cancel buttons
- Loading state during save

**API**:
```js
update: (id, data) => apiRequest(`/surveys/${id}`, {
  method: 'PATCH',
  body: data,
}),
```

### 5.7 Survey Delete Functionality

**Files**: `src/components/admin/DeleteConfirmModal.jsx`, updates to `SurveyCard.jsx`

**Requirements** (FE-ADMIN-09):
- Delete button with trash icon
- Confirmation modal showing survey title
- "Are you sure?" warning text
- Delete and Cancel buttons
- Remove from list after deletion

**API**:
```js
delete: (id) => apiRequest(`/surveys/${id}`, { method: 'DELETE' }),
```

### 5.8 Survey Duplicate Functionality

**Files**: Updates to `SurveyCard.jsx`, `src/api/surveys.js`

**Requirements** (FE-ADMIN-08):
- Duplicate button on survey card
- Prompt for new survey title (modal or inline)
- Call `POST /surveys/{id}/duplicate` endpoint
- Navigate to new survey after creation

**API**:
```js
duplicate: (id, newTitle) => apiRequest(`/surveys/${id}/duplicate`, {
  method: 'POST',
  body: { title: newTitle },
}),
```

**Note**: Backend endpoint `POST /surveys/{id}/duplicate` clones config with new slug/title, clears dates, and sets new `created_by`.

### 5.9 Modal Component

**File**: `src/components/common/Modal.jsx`

Reusable modal for edit, delete confirmation, etc.:
- Overlay background
- Centered content
- Close on Escape key
- Close on overlay click (optional)
- Focus trap for accessibility

### 5.10 Survey Results Page (Complete)

**File**: `src/pages/SurveyResults.jsx` (extend from Stage 4)

Complete version with all features:
- Survey header (title, description, URL, status)
- Stats summary (total responses, completion rate)
- Response table with pagination and search
- Export dropdown
- Edit and Delete buttons

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Student Pairing Survey              [Edit] [Delete]         │
│ Closes Jan 25, 2026 · 24 responses                          │
│ URL: https://... [Copy]                                     │
├─────────────────────────────────────────────────────────────┤
│ [Search...]                         [Export ▼]              │
├─────────────────────────────────────────────────────────────┤
│ ┌────────┬────────────┬─────────────┬────────┬───────────┐  │
│ │ Avatar │ Username   │ Email       │ Status │ Submitted │  │
│ ├────────┼────────────┼─────────────┼────────┼───────────┤  │
│ │ ...    │ ...        │ ...         │ ...    │ ...       │  │
│ └────────┴────────────┴─────────────┴────────┴───────────┘  │
│                                                             │
│ [< Prev]  1  2  3  ...  10  [Next >]                        │
└─────────────────────────────────────────────────────────────┘
```

### 5.11 Survey Stats Component

**File**: `src/components/admin/SurveyStats.jsx`

Display key metrics:
- Total responses
- Completed vs In Progress
- Completion rate percentage
- Time range of responses

### 5.12 Surveys API Module (Complete)

**File**: `src/api/surveys.js` (final version)

```js
import { apiRequest } from './client';

export const surveysApi = {
  // Public
  getPublic: (slug) => apiRequest(`/surveys/${slug}/public`),

  // Admin - List & CRUD
  list: () => apiRequest('/surveys'),
  get: (id) => apiRequest(`/surveys/${id}`),
  create: (config) => apiRequest('/surveys', { method: 'POST', body: config }),
  update: (id, data) => apiRequest(`/surveys/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiRequest(`/surveys/${id}`, { method: 'DELETE' }),
  duplicate: (id, newTitle) => apiRequest(`/surveys/${id}/duplicate`, {
    method: 'POST',
    body: { title: newTitle },
  }),

  // Admin - Responses (supports search, status, pagination)
  getResponses: (id, params) => {
    // params: { limit, offset, search, status }
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/surveys/${id}/responses?${query}`);
  },

  // Admin - Export (uses snake_case param names)
  export: async (id, format, options = {}) => {
    // options: { from_date, to_date, anonymize }
    const params = new URLSearchParams({ format, ...options });
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/surveys/${id}/export?${params}`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },
};
```

## Acceptance Criteria

- [ ] Response table shows all respondents with status
- [ ] Pagination works (next, previous, page numbers)
- [ ] Search filters responses by username
- [ ] Export JSON downloads .json file
- [ ] Export CSV downloads .csv file
- [ ] Edit modal updates survey metadata
- [ ] Delete confirmation removes survey
- [ ] Duplicate creates new survey with same config
- [ ] All modals are keyboard accessible (Escape to close)

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Component-First | Modal, Pagination, SearchInput reusable |
| II. Accessibility | Focus trap in modals, keyboard navigation, screen reader support |
| III. Mobile-First | Table scrolls horizontally on mobile, modal full-width on small screens |
| IV. Security | Delete requires confirmation, export respects permissions |
| V. Type Safety | PropTypes on all components, API response validation |

## Testing Checklist

- [ ] Response table renders with mock data
- [ ] Pagination changes page correctly
- [ ] Search filters results
- [ ] Export triggers file download
- [ ] Edit modal opens, saves, closes
- [ ] Delete modal confirms before deleting
- [ ] Duplicate creates new survey
- [ ] Modals trap focus correctly
- [ ] Escape key closes modals

## Files Created

```
src/
├── api/
│   └── surveys.js (completed)
├── components/
│   ├── admin/
│   │   ├── ResponseTable.jsx
│   │   ├── ExportDropdown.jsx
│   │   ├── ExportOptions.jsx (P2)
│   │   ├── SurveyEditModal.jsx
│   │   ├── DeleteConfirmModal.jsx
│   │   └── SurveyStats.jsx
│   └── common/
│       ├── Modal.jsx
│       ├── Pagination.jsx
│       └── SearchInput.jsx
└── pages/
    └── SurveyResults.jsx (completed)
```

## Post-Stage: Polish & Testing

After Stage 5, the frontend is feature-complete. Final polish includes:
- End-to-end testing of all flows
- Accessibility audit (axe-core)
- Performance optimization (bundle analysis)
- Error boundary implementation
- Loading state consistency check

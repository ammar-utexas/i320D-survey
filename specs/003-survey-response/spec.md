# Stage 003: Survey Response & Question Types

## Overview

This stage implements the survey response functionality for respondents, including all question type components, form rendering grouped by vectors/sections, client-side validation, auto-save capability, and the ability to load/edit existing responses.

## Dependencies

- **Stage 001** (Frontend Foundation): Auth context, routing, layout, header with user menu
- **Stage 002** (Admin Dashboard): Survey management APIs (not directly used here, but establishes API patterns)

## Requirements Traceability

| Requirement | PRD Reference | Priority | Status |
|-------------|---------------|----------|--------|
| Render all question types | FE-RESP-01 | P0 | Planned |
| Group questions by vector | FE-RESP-02 | P0 | Planned |
| Client-side validation | FE-RESP-03 | P0 | Planned |
| Auto-save responses | FE-RESP-04 | P1 | Planned |
| Load existing response | FE-RESP-05 | P1 | Planned |
| Mobile-responsive design | FE-RESP-06 | P1 | Planned |
| Progress indicator | FE-RESP-07 | P2 | Deferred |
| Keyboard navigation | FE-RESP-08 | P2 | Deferred |
| ScaleQuestion component | FE-QTYPE-01 | P0 | Planned |
| SingleChoiceQuestion | FE-QTYPE-02 | P0 | Planned |
| MultiCheckboxQuestion | FE-QTYPE-03 | P0 | Planned |
| DropdownQuestion | FE-QTYPE-04 | P0 | Planned |
| SingleChoiceWithTextQuestion | FE-QTYPE-05 | P0 | Planned |
| OpenTextQuestion | FE-QTYPE-06 | P0 | Planned |

---

## User Stories

### US-001: Take a Survey (P0)
**As a** respondent
**I want to** access a survey via its unique URL and answer all questions
**So that** I can provide my responses to the survey creator

**Acceptance Criteria:**
- [ ] Navigate to `/s/:slug` loads the survey from the backend
- [ ] Survey title and description are displayed at the top
- [ ] Questions are grouped by vector/section with clear visual separation
- [ ] Each question type renders with the appropriate input component
- [ ] Required questions are marked with an asterisk (*)
- [ ] Submit button is visible at the bottom of the form

### US-002: Answer Different Question Types (P0)
**As a** respondent
**I want to** interact with various question formats
**So that** I can provide answers in the appropriate format for each question

**Acceptance Criteria:**
- [ ] Scale questions (1-5) display 5 clickable buttons with "Low" and "High" labels
- [ ] Single choice questions display radio buttons with option labels
- [ ] Multi-checkbox questions display checkboxes allowing multiple selections
- [ ] Dropdown questions display a select element with a placeholder
- [ ] Single choice with text shows radio buttons and conditional textarea
- [ ] Open text questions show a textarea with character counter (max 1000)

### US-003: Validate Responses Before Submission (P0)
**As a** respondent
**I want to** be notified if I miss required questions
**So that** I can complete all necessary fields before submitting

**Acceptance Criteria:**
- [ ] Submit button triggers client-side validation
- [ ] Required questions without answers show error messages
- [ ] Error messages appear inline below the question
- [ ] Form scrolls to the first error field
- [ ] Submission is blocked until all required fields are filled

### US-004: Auto-save Progress (P1)
**As a** respondent
**I want to** have my answers automatically saved as I progress
**So that** I don't lose my work if I leave the page

**Acceptance Criteria:**
- [ ] Changes trigger auto-save after 2 seconds of inactivity (debounced)
- [ ] "Saving..." indicator appears during save operation
- [ ] "All changes saved" confirmation appears after successful save
- [ ] Auto-save sends `is_draft: true` to the backend
- [ ] Network errors are handled gracefully with retry logic

### US-005: Resume Incomplete Survey (P1)
**As a** respondent
**I want to** continue a previously started survey
**So that** I can complete it across multiple sessions

**Acceptance Criteria:**
- [ ] On page load, fetch existing response via GET `/surveys/:slug/my-response`
- [ ] If response exists, pre-fill all form fields with saved answers
- [ ] Display "Last saved: [timestamp]" indicator
- [ ] If `is_draft: true`, show "Submit Survey" button
- [ ] If `is_draft: false`, show "Update Response" button

### US-006: Submit Final Response (P0)
**As a** respondent
**I want to** submit my completed survey
**So that** my responses are recorded as final

**Acceptance Criteria:**
- [ ] Click "Submit Survey" validates all required fields
- [ ] If valid, sends POST with `is_draft: false`
- [ ] Success message displayed after submission
- [ ] Page shows confirmation or thank you message
- [ ] User can still edit and update after submission

### US-007: View Survey on Mobile (P1)
**As a** respondent using a mobile device
**I want to** complete the survey on my phone
**So that** I can respond from anywhere

**Acceptance Criteria:**
- [ ] Layout is responsive and readable on mobile viewports
- [ ] Touch targets are at least 44px for accessibility
- [ ] Sections stack vertically on narrow screens
- [ ] Scale buttons are large enough to tap accurately
- [ ] Text is readable without horizontal scrolling

---

## Component Architecture

### File Structure

```
src/
├── api/
│   └── responses.js           # Response API functions
├── components/
│   └── survey/
│       ├── SurveyForm.jsx          # Main form container
│       ├── SurveySection.jsx       # Vector/section wrapper
│       ├── QuestionRenderer.jsx    # Dispatches to type components
│       ├── ScaleQuestion.jsx       # scale_1_5 type
│       ├── SingleChoiceQuestion.jsx # single_choice type
│       ├── MultiCheckboxQuestion.jsx # multi_checkbox type
│       ├── DropdownQuestion.jsx    # dropdown type
│       ├── SingleChoiceWithTextQuestion.jsx # single_choice_with_text
│       ├── OpenTextQuestion.jsx    # open_text type
│       ├── AutoSaveIndicator.jsx   # Save status display
│       └── QuestionError.jsx       # Inline error display
├── hooks/
│   └── useAutoSave.js          # Debounced auto-save logic
├── pages/
│   └── SurveyRespond.jsx       # /s/:slug page component
└── utils/
    └── validation.js           # Form validation helpers
```

---

## Question Type Components

### ScaleQuestion (FE-QTYPE-01)
**Type:** `scale_1_5`
**Stored Value:** Integer (1-5)

- 5 buttons in a row, labeled "1" through "5"
- "Low" label under button 1, "High" under button 5
- Selected button has distinct visual style (filled/highlighted)

### SingleChoiceQuestion (FE-QTYPE-02)
**Type:** `single_choice`
**Stored Value:** String (selected option)

- Radio button group
- Each option has a radio input and label
- Only one option can be selected

### MultiCheckboxQuestion (FE-QTYPE-03)
**Type:** `multi_checkbox`
**Stored Value:** Array of strings (selected options)

- Checkbox group with multiple selectable options
- Toggle option in array on change

### DropdownQuestion (FE-QTYPE-04)
**Type:** `dropdown`
**Stored Value:** String (selected option)

- Select element with placeholder "Select an option..."
- Option elements for each choice

### SingleChoiceWithTextQuestion (FE-QTYPE-05)
**Type:** `single_choice_with_text`
**Stored Value:** `{ choice: string, text: string }`

- Radio button group + conditional textarea
- Textarea label from `question.text_prompt`
- Show textarea when any option is selected

### OpenTextQuestion (FE-QTYPE-06)
**Type:** `open_text`
**Stored Value:** String

- Textarea element with maxLength=1000
- Character counter showing "X/1000"

---

## API Integration

### Endpoints

#### GET /surveys/{slug}/public
Fetch survey configuration for rendering

#### GET /surveys/{slug}/my-response
Fetch user's existing response (returns `null` if none)

#### POST /surveys/{slug}/respond
Submit or update response (upsert)
- `is_draft: true` - Auto-save
- `is_draft: false` - Final submission

### API Client Functions

```javascript
// api/responses.js
import { apiRequest } from './client';

export const responsesApi = {
  getSurvey: (slug) => apiRequest(`/surveys/${slug}/public`),
  getMyResponse: (slug) => apiRequest(`/surveys/${slug}/my-response`),
  submit: (slug, data) => apiRequest(`/surveys/${slug}/respond`, {
    method: 'POST',
    body: data,
  }),
};
```

---

## Hooks

### useAutoSave
Debounced auto-save with status tracking

**Returns:**
- `status`: 'idle' | 'saving' | 'saved' | 'error'
- `lastSaved`: Date | null
- `saveNow`: () => Promise<void>

---

## Implementation Checklist

### Phase 1: Core Components (P0)
- [ ] Create `api/responses.js` with API functions
- [ ] Create `QuestionRenderer.jsx` dispatcher
- [ ] Create `ScaleQuestion.jsx`
- [ ] Create `SingleChoiceQuestion.jsx`
- [ ] Create `MultiCheckboxQuestion.jsx`
- [ ] Create `DropdownQuestion.jsx`
- [ ] Create `SingleChoiceWithTextQuestion.jsx`
- [ ] Create `OpenTextQuestion.jsx`
- [ ] Create `SurveySection.jsx`
- [ ] Create `SurveyForm.jsx`
- [ ] Create `SurveyRespond.jsx` page
- [ ] Implement validation in `utils/validation.js`
- [ ] Add route `/s/:slug` to App.jsx

### Phase 2: Enhanced Features (P1)
- [ ] Create `useAutoSave.js` hook
- [ ] Create `AutoSaveIndicator.jsx`
- [ ] Load existing response on page mount
- [ ] Pre-fill form with saved answers
- [ ] Mobile-responsive styling adjustments
- [ ] Touch-friendly input sizing

### Phase 3: Polish (P2) - Deferred
- [ ] Progress indicator component
- [ ] Keyboard navigation enhancements
- [ ] Animation/transitions

---

## Success Criteria

### Phase 1 (P0) Complete When:
- [ ] Survey loads and renders all question types
- [ ] Questions grouped by vector/section
- [ ] Client-side validation works
- [ ] Submit sends response to backend

### Phase 2 (P1) Complete When:
- [ ] Auto-save works with debounce
- [ ] Existing responses pre-fill form
- [ ] Mobile responsive design works
- [ ] Touch targets are 44px minimum

### Phase 3 (P2) Complete When:
- [ ] Progress indicator shows completion %
- [ ] Full keyboard navigation support

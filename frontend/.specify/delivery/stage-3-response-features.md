# Stage 3: Survey Response Features

**Status**: Not Started
**Priority**: P1 (High Value)
**Estimated Scope**: Enhanced respondent experience
**Dependencies**: Stage 2 (Question Components & Survey Form)

## Objective

Enhance the survey response experience with auto-save, progress tracking, validation, and the ability to resume incomplete surveys. At the end of this stage, respondents have a polished, resilient survey-taking experience.

## Deliverables

### 3.1 Auto-Save Functionality

**Files**: `src/hooks/useAutoSave.js`, updates to `SurveyForm.jsx`

**Requirements** (FE-RESP-04):
- Debounced save (2 seconds after last change)
- "Saving..." indicator during save
- "All changes saved" confirmation
- Handle offline/error gracefully
- Use upsert endpoint with `is_draft: true` for auto-save

```jsx
// Hook interface
const { saving, lastSaved, error } = useAutoSave(slug, answers, {
  debounceMs: 2000,
  enabled: true,
});

// Internal implementation uses saveDraft (is_draft: true)
// Final submit button uses submit (is_draft: false)
```

### 3.2 Auto-Save Indicator Component

**File**: `src/components/survey/AutoSaveIndicator.jsx`

States to display:
| State | Display |
|-------|---------|
| Idle | "All changes saved ✓" (muted text) |
| Saving | "Saving..." with spinner |
| Error | "Failed to save. Retrying..." (red text) |
| Offline | "You're offline. Changes will save when reconnected." |

**Accessibility**:
- Use `aria-live="polite"` for status updates
- Don't announce every idle state (only transitions)

### 3.3 Load Existing Response

**Files**: Updates to `SurveyRespond.jsx`, `src/api/responses.js`

**Requirements** (FE-RESP-05):
- Fetch user's response on page load via `GET /surveys/:slug/my-response`
- Pre-fill form with saved answers
- Show button based on `is_draft` status:
  - `is_draft: true` (or no response) → "Submit Survey" button
  - `is_draft: false` → "Update Response" button
- Display last saved timestamp from `updated_at`

```jsx
// Button logic based on response status
const getSubmitButtonText = (existingResponse) => {
  if (!existingResponse) return 'Submit Survey';
  if (existingResponse.is_draft) return 'Submit Survey';
  return 'Update Response';
};
```

### 3.4 Progress Indicator

**File**: `src/components/survey/ProgressBar.jsx`

**Requirements** (FE-RESP-07):
- Progress bar at top of survey
- Show percentage (e.g., "60% complete")
- Calculate based on required questions answered
- Update in real-time as user fills form

```jsx
// Props
<ProgressBar
  answered={12}
  total={20}
  showPercentage={true}
/>
```

**Accessibility**:
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label="Survey progress"`

### 3.5 Client-Side Validation

**Files**: `src/utils/validation.js`, updates to `SurveyForm.jsx`

**Requirements** (FE-RESP-03):
- Validate required fields before submission
- Highlight required fields not filled (red border)
- Show error messages next to fields
- Prevent form submission until valid
- Scroll to first error field

```js
// Validation function
export function validateSurvey(config, answers) {
  const errors = {}; // { [questionId]: errorMessage }

  config.vectors.forEach(vector => {
    vector.questions.forEach(question => {
      if (question.required && !hasAnswer(answers[question.question_id])) {
        errors[question.question_id] = 'This field is required';
      }
    });
  });

  return { valid: Object.keys(errors).length === 0, errors };
}
```

### 3.6 Form Error Display

**File**: `src/components/common/FormError.jsx`

Display validation errors inline with questions:
- Red text below the question
- Icon indicator
- Announced to screen readers

### 3.7 Mobile Responsive Polish

**Updates**: All survey components

**Requirements** (FE-RESP-06):
- Responsive layout (mobile-first)
- Touch-friendly input sizes (min 44px tap targets)
- Stack sections vertically on mobile
- Readable text sizes (min 16px for inputs to prevent zoom)

**Breakpoint adjustments**:
```jsx
// Scale buttons: row on desktop, can wrap on mobile
<div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-between">

// Section padding
<section className="p-4 sm:p-6">

// Submit button: full width on mobile
<button className="w-full sm:w-auto">
```

### 3.8 Keyboard Navigation Enhancement

**Updates**: Question components

**Requirements** (FE-RESP-08):
- Tab navigation between questions
- Enter/Space to select options
- Arrow keys for radio/scale questions
- Focus visible indicators (already in Tailwind: `focus:ring-2`)

### 3.9 Survey Closed State

**File**: Updates to `SurveyRespond.jsx`

Handle survey availability:
- Check `opens_at` and `closes_at` from survey config
- Display "This survey is not yet open" if before `opens_at`
- Display "This survey is closed" if after `closes_at`
- Full-page message with link back (if authenticated) or login

### 3.10 Responses API Module

**File**: `src/api/responses.js`

```js
import { apiRequest } from './client';

export const responsesApi = {
  // Get user's existing response (includes is_draft status)
  getMyResponse: (slug) => apiRequest(`/surveys/${slug}/my-response`),

  // Auto-save as draft (is_draft: true)
  saveDraft: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
    method: 'POST',
    body: { answers, is_draft: true },
  }),

  // Final submission (is_draft: false)
  submit: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
    method: 'POST',
    body: { answers, is_draft: false },
  }),
};
```

**Response includes**:
- `is_draft: boolean` - Whether response is a draft or final submission
- `submitted_at: timestamp | null` - Set when `is_draft` becomes `false`
- `updated_at: timestamp` - Last modification time

## Acceptance Criteria

- [ ] Changes auto-save 2 seconds after last edit
- [ ] Save indicator shows "Saving..." then "All changes saved"
- [ ] Returning users see their previous answers pre-filled
- [ ] Progress bar shows percentage of required questions answered
- [ ] Empty required fields show error on submit attempt
- [ ] Form scrolls to first error field
- [ ] Survey works well on mobile (no horizontal scroll, readable)
- [ ] Closed surveys show appropriate message
- [ ] Keyboard-only users can complete entire survey

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Component-First | ProgressBar, AutoSaveIndicator as reusable |
| II. Accessibility | aria-live for save status, focus management, keyboard nav |
| III. Mobile-First | 44px touch targets, responsive breakpoints, no zoom on input |
| IV. Security | Validation prevents malformed submissions |
| V. Type Safety | Validation utility with clear error types |

## Testing Checklist

- [ ] Auto-save triggers after 2 seconds of inactivity
- [ ] Save indicator transitions through states correctly
- [ ] Existing response loads and pre-fills form
- [ ] Progress bar calculates percentage correctly
- [ ] Validation catches all required field errors
- [ ] Scroll to error works across browsers
- [ ] Mobile layout has no overflow issues
- [ ] Keyboard navigation reaches all form elements

## Files Created/Modified

```
src/
├── api/
│   └── responses.js (new)
├── components/
│   ├── common/
│   │   └── FormError.jsx (new)
│   └── survey/
│       ├── AutoSaveIndicator.jsx (new)
│       ├── ProgressBar.jsx (new)
│       ├── SurveyForm.jsx (modified)
│       └── [question components] (modified for mobile)
├── hooks/
│   └── useAutoSave.js (new)
├── utils/
│   └── validation.js (new)
└── pages/
    └── SurveyRespond.jsx (modified)
```

## Next Stage

Upon completion, proceed to **Stage 4: Admin Dashboard Core** (survey list, creation).

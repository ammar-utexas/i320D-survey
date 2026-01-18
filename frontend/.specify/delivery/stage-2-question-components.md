# Stage 2: Question Components & Survey Form

**Status**: Not Started
**Priority**: P0 (Critical Path)
**Estimated Scope**: All question types + basic survey rendering
**Dependencies**: Stage 1 (Foundation & Authentication)

## Objective

Build all six question type components and the survey form structure. At the end of this stage, users can view and interact with a complete survey, though submission is basic (no auto-save yet).

## Deliverables

### 2.1 Question Type Components

Each component receives `question`, `value`, and `onChange` props.

| Component | Type | PRD Ref | Stored Value |
|-----------|------|---------|--------------|
| ScaleQuestion | `scale_1_5` | FE-QTYPE-01 | Integer 1-5 |
| SingleChoiceQuestion | `single_choice` | FE-QTYPE-02 | String |
| MultiCheckboxQuestion | `multi_checkbox` | FE-QTYPE-03 | Array of strings |
| DropdownQuestion | `dropdown` | FE-QTYPE-04 | String |
| SingleChoiceWithTextQuestion | `single_choice_with_text` | FE-QTYPE-05 | `{choice, text}` |
| OpenTextQuestion | `open_text` | FE-QTYPE-06 | String |

### 2.2 ScaleQuestion Component

**File**: `src/components/survey/ScaleQuestion.jsx`

**Requirements** (FE-QTYPE-01):
- 5 clickable buttons in a row
- Labels: "1" to "5" with "Low" and "High" at endpoints
- Selected state visually distinct (blue background)
- Store integer value (1-5)

```jsx
// Visual layout
[1]   [2]   [3]   [4]   [5]
Low                   High
```

**Accessibility**:
- Radio group semantics (`role="radiogroup"`)
- Arrow key navigation between options
- Focus visible on selected button

### 2.3 SingleChoiceQuestion Component

**File**: `src/components/survey/SingleChoiceQuestion.jsx`

**Requirements** (FE-QTYPE-02):
- Radio button for each option from `question.options`
- Option text as label
- Only one selectable
- Store selected option string

**Accessibility**:
- Native `<input type="radio">` elements
- Associated `<label>` for each option
- Fieldset with legend for question text

### 2.4 MultiCheckboxQuestion Component

**File**: `src/components/survey/MultiCheckboxQuestion.jsx`

**Requirements** (FE-QTYPE-03):
- Checkbox for each option from `question.options`
- Option text as label
- Multiple selectable
- Store array of selected strings

**Accessibility**:
- Native `<input type="checkbox">` elements
- Associated `<label>` for each option
- Group announced to screen readers

### 2.5 DropdownQuestion Component

**File**: `src/components/survey/DropdownQuestion.jsx`

**Requirements** (FE-QTYPE-04):
- Select element with placeholder "Select an option..."
- Options from `question.options`
- Store selected option string

**Accessibility**:
- Native `<select>` element
- Associated `<label>`
- Keyboard navigable

### 2.6 SingleChoiceWithTextQuestion Component

**File**: `src/components/survey/SingleChoiceWithTextQuestion.jsx`

**Requirements** (FE-QTYPE-05):
- Radio buttons for options
- Textarea appears when specific option selected (configurable)
- `question.text_prompt` as textarea label
- Store `{choice: string, text: string}`

**Accessibility**:
- Conditional textarea announced when revealed
- Clear relationship between choice and text input

### 2.7 OpenTextQuestion Component

**File**: `src/components/survey/OpenTextQuestion.jsx`

**Requirements** (FE-QTYPE-06):
- Textarea element
- `maxLength=1000`
- Character counter showing "X/1000"
- Store string value

**Accessibility**:
- Associated label
- Character count announced via aria-live region

### 2.8 QuestionRenderer Component

**File**: `src/components/survey/QuestionRenderer.jsx`

Dispatches to the appropriate question component based on `question.type`:

```jsx
const questionComponents = {
  scale_1_5: ScaleQuestion,
  single_choice: SingleChoiceQuestion,
  multi_checkbox: MultiCheckboxQuestion,
  dropdown: DropdownQuestion,
  single_choice_with_text: SingleChoiceWithTextQuestion,
  open_text: OpenTextQuestion,
};
```

**Props**:
- `question` - Question object with type, options, etc.
- `value` - Current answer value
- `onChange` - Callback when answer changes
- `error` - Validation error message (optional)

### 2.9 Survey Section Component

**File**: `src/components/survey/SurveySection.jsx`

Groups questions by vector (FE-RESP-02):
- Card container for each vector
- Vector name as section header
- Visual separation between sections
- Questions numbered within sections

### 2.10 Survey Form Component

**File**: `src/components/survey/SurveyForm.jsx`

**Requirements** (FE-RESP-01, FE-RESP-02):
- Renders survey title and description
- Maps vectors to SurveySection components
- Manages form state (answers object)
- Submit button (basic, no auto-save yet)

### 2.11 Survey Response Page

**File**: `src/pages/SurveyRespond.jsx`

**Requirements**:
- Route: `/s/:slug`
- Fetch survey config from API
- Render SurveyForm
- Handle basic submission
- Loading and error states

### 2.12 Survey API Module

**File**: `src/api/surveys.js`

```js
export const surveysApi = {
  getPublic: (slug) => apiRequest(`/surveys/${slug}/public`),
  respond: (slug, answers) => apiRequest(`/surveys/${slug}/respond`, {
    method: 'POST',
    body: { answers },
  }),
};
```

## Acceptance Criteria

- [ ] All 6 question types render correctly
- [ ] ScaleQuestion shows 5 buttons with Low/High labels
- [ ] SingleChoiceQuestion allows only one selection
- [ ] MultiCheckboxQuestion allows multiple selections
- [ ] DropdownQuestion shows select with options
- [ ] SingleChoiceWithTextQuestion shows conditional textarea
- [ ] OpenTextQuestion shows character counter
- [ ] Questions grouped by vector with headers
- [ ] Survey loads from `/s/:slug` route
- [ ] Basic form submission works

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Component-First | Each question type is a standalone component |
| II. Accessibility | Native form elements, labels, keyboard nav, ARIA |
| III. Mobile-First | Touch-friendly inputs (44px min), responsive layout |
| IV. Security | User input not rendered as HTML |
| V. Type Safety | PropTypes for all components |

## Testing Checklist

- [ ] Each question component renders with mock data
- [ ] Value changes propagate via onChange
- [ ] Required field indicator shows asterisk
- [ ] Error messages display below questions
- [ ] Keyboard navigation works for all types
- [ ] Screen reader announces question text

## Files Created

```
src/
├── api/
│   └── surveys.js
├── components/
│   └── survey/
│       ├── QuestionRenderer.jsx
│       ├── ScaleQuestion.jsx
│       ├── SingleChoiceQuestion.jsx
│       ├── MultiCheckboxQuestion.jsx
│       ├── DropdownQuestion.jsx
│       ├── SingleChoiceWithTextQuestion.jsx
│       ├── OpenTextQuestion.jsx
│       ├── SurveySection.jsx
│       └── SurveyForm.jsx
└── pages/
    └── SurveyRespond.jsx
```

## Next Stage

Upon completion, proceed to **Stage 3: Survey Response Features** (auto-save, progress, validation).

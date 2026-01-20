# Tasks: Survey Response & Question Types

**Feature**: Survey Response & Question Types (Stage 003)
**Input**: Design documents from `/specs/003-survey-response/`
**Prerequisites**: Stage 001 (Frontend Foundation) complete
**Tests**: Not explicitly requested - test tasks omitted

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `frontend/`
- **Source**: `frontend/src/`
- **Components**: `frontend/src/components/`
- **Survey components**: `frontend/src/components/survey/`
- **API modules**: `frontend/src/api/`
- **Hooks**: `frontend/src/hooks/`
- **Utils**: `frontend/src/utils/`

---

## Phase 1: Setup (Foundation for Survey Response)

**Purpose**: Create shared utilities, API module, and directory structure needed by all user stories

- [ ] T001 Create responses API module with getSurvey, getMyResponse, submit methods in `frontend/src/api/responses.js`
- [ ] T002 [P] Create survey components directory structure `frontend/src/components/survey/`
- [ ] T003 [P] Create validation utility with validateRequired, validateForm functions in `frontend/src/utils/validation.js`
- [ ] T004 [P] Create QuestionError component for inline error display in `frontend/src/components/survey/QuestionError.jsx`

**Checkpoint**: Foundation ready - question type components can begin

---

## Phase 2: User Story 2 - Answer Different Question Types (Priority: P0)

**Goal**: Respondents can interact with various question formats

**Independent Test**: Render each question type in isolation → Interact with input → Value stored correctly

### Implementation for User Story 2

- [ ] T005 [US2] Create ScaleQuestion component with 5 clickable buttons in `frontend/src/components/survey/ScaleQuestion.jsx`
- [ ] T006 [US2] Add "Low" and "High" endpoint labels to ScaleQuestion in `frontend/src/components/survey/ScaleQuestion.jsx`
- [ ] T007 [US2] Implement selected state styling (filled/highlighted) in `frontend/src/components/survey/ScaleQuestion.jsx`
- [ ] T008 [P] [US2] Create SingleChoiceQuestion component with radio buttons in `frontend/src/components/survey/SingleChoiceQuestion.jsx`
- [ ] T009 [P] [US2] Create MultiCheckboxQuestion component with checkbox group in `frontend/src/components/survey/MultiCheckboxQuestion.jsx`
- [ ] T010 [P] [US2] Create DropdownQuestion component with select element in `frontend/src/components/survey/DropdownQuestion.jsx`
- [ ] T011 [US2] Add placeholder "Select an option..." to DropdownQuestion in `frontend/src/components/survey/DropdownQuestion.jsx`
- [ ] T012 [P] [US2] Create SingleChoiceWithTextQuestion with radio buttons in `frontend/src/components/survey/SingleChoiceWithTextQuestion.jsx`
- [ ] T013 [US2] Add conditional textarea (shown when option selected) in `frontend/src/components/survey/SingleChoiceWithTextQuestion.jsx`
- [ ] T014 [US2] Use question.text_prompt as textarea label in `frontend/src/components/survey/SingleChoiceWithTextQuestion.jsx`
- [ ] T015 [P] [US2] Create OpenTextQuestion component with textarea in `frontend/src/components/survey/OpenTextQuestion.jsx`
- [ ] T016 [US2] Add character counter (X/1000) to OpenTextQuestion in `frontend/src/components/survey/OpenTextQuestion.jsx`
- [ ] T017 [US2] Add maxLength=1000 constraint to OpenTextQuestion in `frontend/src/components/survey/OpenTextQuestion.jsx`
- [ ] T018 [US2] Create QuestionRenderer dispatcher component in `frontend/src/components/survey/QuestionRenderer.jsx`
- [ ] T019 [US2] Map question.type to appropriate component in QuestionRenderer in `frontend/src/components/survey/QuestionRenderer.jsx`

**Checkpoint**: User Story 2 complete - All 6 question types render and accept input

---

## Phase 3: User Story 1 - Take a Survey (Priority: P0)

**Goal**: Respondents can access a survey via URL and see all questions

**Independent Test**: Navigate to /s/:slug → Survey loads → Title, description, sections visible

### Implementation for User Story 1

- [ ] T020 [US1] Create SurveySection component with vector name header in `frontend/src/components/survey/SurveySection.jsx`
- [ ] T021 [US1] Add visual separation (card styling) between sections in `frontend/src/components/survey/SurveySection.jsx`
- [ ] T022 [US1] Render questions within section using QuestionRenderer in `frontend/src/components/survey/SurveySection.jsx`
- [ ] T023 [US1] Mark required questions with asterisk (*) in `frontend/src/components/survey/SurveySection.jsx`
- [ ] T024 [US1] Create SurveyForm container component in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T025 [US1] Display survey title and description at top in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T026 [US1] Render SurveySection for each vector in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T027 [US1] Manage answers state as Record<question_id, value> in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T028 [US1] Add Submit button at bottom of form in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T029 [US1] Create SurveyRespond page component in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T030 [US1] Fetch survey via GET /surveys/:slug/public on mount in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T031 [US1] Add loading state while fetching survey in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T032 [US1] Add error state for survey not found or closed in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T033 [US1] Add route /s/:slug to App.jsx in `frontend/src/App.jsx`

**Checkpoint**: User Story 1 complete - Survey page renders with all sections and questions

---

## Phase 4: User Story 3 - Validate Responses Before Submission (Priority: P0)

**Goal**: Respondents are notified of missing required fields

**Independent Test**: Leave required question blank → Click Submit → Error shown, scroll to field

### Implementation for User Story 3

- [ ] T034 [US3] Implement validateRequired function for single question in `frontend/src/utils/validation.js`
- [ ] T035 [US3] Implement validateForm function for entire survey in `frontend/src/utils/validation.js`
- [ ] T036 [US3] Handle each question type's value format in validation in `frontend/src/utils/validation.js`
- [ ] T037 [US3] Add errors state to SurveyForm in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T038 [US3] Trigger validation on Submit button click in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T039 [US3] Display QuestionError below questions with errors in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T040 [US3] Scroll to first error field on validation failure in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T041 [US3] Block submission until all required fields are filled in `frontend/src/components/survey/SurveyForm.jsx`

**Checkpoint**: User Story 3 complete - Validation prevents incomplete submissions

---

## Phase 5: User Story 6 - Submit Final Response (Priority: P0)

**Goal**: Respondents can submit completed surveys

**Independent Test**: Fill all required fields → Click Submit → Success message shown

### Implementation for User Story 6

- [ ] T042 [US6] Implement submit handler with POST /surveys/:slug/respond in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T043 [US6] Send is_draft: false for final submission in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T044 [US6] Add submitting state with loading indicator on button in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T045 [US6] Display success message after submission in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T046 [US6] Show thank you / confirmation state in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T047 [US6] Handle submission errors gracefully in `frontend/src/pages/SurveyRespond.jsx`

**Checkpoint**: User Story 6 complete - Surveys can be submitted successfully

---

## Phase 6: User Story 4 - Auto-save Progress (Priority: P1)

**Goal**: Answers are automatically saved as user progresses

**Independent Test**: Answer questions → Wait 2 seconds → "All changes saved" indicator appears

### Implementation for User Story 4

- [ ] T048 [US4] Create useAutoSave hook with debounce logic in `frontend/src/hooks/useAutoSave.js`
- [ ] T049 [US4] Implement 2-second debounce on changes in `frontend/src/hooks/useAutoSave.js`
- [ ] T050 [US4] Return status: 'idle' | 'saving' | 'saved' | 'error' from hook in `frontend/src/hooks/useAutoSave.js`
- [ ] T051 [US4] Return lastSaved timestamp from hook in `frontend/src/hooks/useAutoSave.js`
- [ ] T052 [US4] Send is_draft: true for auto-save requests in `frontend/src/hooks/useAutoSave.js`
- [ ] T053 [US4] Add retry logic for network errors in `frontend/src/hooks/useAutoSave.js`
- [ ] T054 [US4] Create AutoSaveIndicator component in `frontend/src/components/survey/AutoSaveIndicator.jsx`
- [ ] T055 [US4] Show "Saving..." during save operation in `frontend/src/components/survey/AutoSaveIndicator.jsx`
- [ ] T056 [US4] Show "All changes saved" after successful save in `frontend/src/components/survey/AutoSaveIndicator.jsx`
- [ ] T057 [US4] Integrate useAutoSave into SurveyForm in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T058 [US4] Add AutoSaveIndicator to SurveyRespond page in `frontend/src/pages/SurveyRespond.jsx`

**Checkpoint**: User Story 4 complete - Responses auto-save with status indicator

---

## Phase 7: User Story 5 - Resume Incomplete Survey (Priority: P1)

**Goal**: Previously started surveys can be continued

**Independent Test**: Start survey → Leave → Return → Previous answers pre-filled

### Implementation for User Story 5

- [ ] T059 [US5] Fetch existing response via GET /surveys/:slug/my-response on mount in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T060 [US5] Pre-fill form fields with saved answers in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T061 [US5] Display "Last saved: [timestamp]" indicator in `frontend/src/pages/SurveyRespond.jsx`
- [ ] T062 [US5] Show "Submit Survey" button if is_draft: true in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T063 [US5] Show "Update Response" button if is_draft: false in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T064 [US5] Handle case where no prior response exists in `frontend/src/pages/SurveyRespond.jsx`

**Checkpoint**: User Story 5 complete - Users can resume incomplete surveys

---

## Phase 8: User Story 7 - View Survey on Mobile (Priority: P1)

**Goal**: Survey is usable on mobile devices

**Independent Test**: Open survey on 320px viewport → All elements accessible and readable

### Implementation for User Story 7

- [ ] T065 [US7] Add responsive styles to SurveyForm (stack vertically) in `frontend/src/components/survey/SurveyForm.jsx`
- [ ] T066 [US7] Add responsive styles to SurveySection in `frontend/src/components/survey/SurveySection.jsx`
- [ ] T067 [US7] Ensure ScaleQuestion buttons have 44px min touch targets in `frontend/src/components/survey/ScaleQuestion.jsx`
- [ ] T068 [US7] Ensure radio/checkbox inputs have 44px min touch targets in `frontend/src/components/survey/SingleChoiceQuestion.jsx`
- [ ] T069 [P] [US7] Ensure checkbox inputs have 44px min touch targets in `frontend/src/components/survey/MultiCheckboxQuestion.jsx`
- [ ] T070 [US7] Ensure dropdown has adequate touch target in `frontend/src/components/survey/DropdownQuestion.jsx`
- [ ] T071 [US7] Ensure readable text sizes (min 16px) throughout in `frontend/src/components/survey/SurveyForm.jsx`

**Checkpoint**: User Story 7 complete - Survey works on mobile devices

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T072 [P] Add PropTypes to all survey components
- [ ] T073 [P] Add focus ring styles to all interactive elements
- [ ] T074 Add ARIA labels to scale buttons
- [ ] T075 Add ARIA labels to form elements
- [ ] T076 Ensure error messages are announced to screen readers
- [ ] T077 Test keyboard navigation through entire survey
- [ ] T078 Validate responsive design on tablet viewport (768px)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (US2 Question Types)**: Depends on Phase 1 (QuestionError component)
- **Phase 3 (US1 Take Survey)**: Depends on Phase 2 (QuestionRenderer exists)
- **Phase 4 (US3 Validation)**: Depends on Phase 3 (SurveyForm exists)
- **Phase 5 (US6 Submit)**: Depends on Phase 4 (validation integrated)
- **Phase 6 (US4 Auto-save)**: Depends on Phase 5 (submit flow works)
- **Phase 7 (US5 Resume)**: Depends on Phase 6 (auto-save creates drafts)
- **Phase 8 (US7 Mobile)**: Depends on Phase 3 (components exist)
- **Phase 9 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US2 (Question Types)**: Independent after Phase 1
- **US1 (Take Survey)**: Depends on US2 (needs question components)
- **US3 (Validation)**: Depends on US1 (needs form structure)
- **US6 (Submit)**: Depends on US3 (needs validation)
- **US4 (Auto-save)**: Depends on US6 (shares submit logic)
- **US5 (Resume)**: Depends on US4 (needs auto-save data)
- **US7 (Mobile)**: Can run in parallel with US4-US6

### Parallel Opportunities

**Phase 1 (all parallel):**
```
T001, T002, T003, T004 can run in parallel
```

**Phase 2 (significant parallel):**
```
T005-T007 (ScaleQuestion) sequential
T008 (SingleChoice), T009 (MultiCheckbox), T010-T011 (Dropdown), T012-T014 (SingleChoiceWithText), T015-T017 (OpenText) can run in parallel
```

**Phase 8 (partial parallel):**
```
T067, T068, T069, T070 can run in parallel (different files)
```

---

## Implementation Strategy

### MVP First (P0 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: US2 (Question Types)
3. Complete Phase 3: US1 (Take Survey)
4. Complete Phase 4: US3 (Validation)
5. Complete Phase 5: US6 (Submit)
6. **STOP and VALIDATE**: Test complete survey flow end-to-end
7. Deploy/demo if ready

### Incremental Delivery

1. P0 Stories (US1, US2, US3, US6) → Core survey taking workflow
2. P1 Stories (US4, US5, US7) → Enhanced experience (auto-save, resume, mobile)
3. P2 Stories → Deferred (progress indicator, keyboard nav)
4. Polish → Final validation

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T004 | - |
| 2 | US2: Question Types | T005-T019 | P0 |
| 3 | US1: Take Survey | T020-T033 | P0 |
| 4 | US3: Validation | T034-T041 | P0 |
| 5 | US6: Submit Response | T042-T047 | P0 |
| 6 | US4: Auto-save | T048-T058 | P1 |
| 7 | US5: Resume Survey | T059-T064 | P1 |
| 8 | US7: Mobile | T065-T071 | P1 |
| 9 | Polish | T072-T078 | - |

**Total Tasks**: 78
**P0 Tasks**: 47 (Setup + US1, US2, US3, US6)
**P1 Tasks**: 24 (US4, US5, US7)
**Polish Tasks**: 7

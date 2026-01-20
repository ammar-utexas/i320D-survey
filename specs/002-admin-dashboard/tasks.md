# Tasks: Survey Admin Dashboard

**Feature**: Survey Admin Dashboard (Stage 002)
**Input**: Design documents from `/specs/002-admin-dashboard/`
**Prerequisites**: Stage 001 (Frontend Foundation) complete
**Tests**: Not explicitly requested - test tasks omitted

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US9)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `frontend/`
- **Source**: `frontend/src/`
- **Components**: `frontend/src/components/`
- **API modules**: `frontend/src/api/`

---

## Phase 1: Setup (Foundation for Admin Features)

**Purpose**: Create shared utilities and API module needed by all user stories

- [ ] T001 Create surveys API module with CRUD methods in `frontend/src/api/surveys.js`
- [ ] T002 [P] Create clipboard utility for copy functionality in `frontend/src/utils/clipboard.js`
- [ ] T003 [P] Create date/time formatters utility in `frontend/src/utils/formatters.js`
- [ ] T004 [P] Create admin components directory structure `frontend/src/components/admin/`

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 2: User Story 1 - Upload Survey JSON (Priority: P0)

**Goal**: Admins can create surveys by uploading JSON configuration files

**Independent Test**: Navigate to /surveys/new → Upload valid JSON → See success with survey URL

### Implementation for User Story 1

- [ ] T005 [US1] Create FileUpload component with drag-and-drop in `frontend/src/components/admin/FileUpload.jsx`
- [ ] T006 [US1] Add file type validation (.json only) and size display in `frontend/src/components/admin/FileUpload.jsx`
- [ ] T007 [US1] Create ValidationErrors component for backend errors in `frontend/src/components/admin/ValidationErrors.jsx`
- [ ] T008 [US1] Create SurveyUrlCopy component with copy button in `frontend/src/components/admin/SurveyUrlCopy.jsx`
- [ ] T009 [US1] Implement copy to clipboard with visual feedback in `frontend/src/components/admin/SurveyUrlCopy.jsx`
- [ ] T010 [US1] Create SurveyCreate page with upload flow in `frontend/src/pages/SurveyCreate.jsx`
- [ ] T011 [US1] Add success state showing generated survey URL in `frontend/src/pages/SurveyCreate.jsx`
- [ ] T012 [US1] Add route /surveys/new to App.jsx in `frontend/src/App.jsx`

**Checkpoint**: User Story 1 complete - Admins can upload JSON and create surveys

---

## Phase 3: User Story 2 - View My Surveys (Priority: P0)

**Goal**: Admins see a dashboard with all their surveys

**Independent Test**: Login as admin → Navigate to /dashboard → See list of surveys with status

### Implementation for User Story 2

- [ ] T013 [US2] Create SurveyCard component with title, status, dates in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T014 [US2] Implement status badge (Scheduled/Open/Closed) based on dates in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T015 [US2] Add response count display to SurveyCard in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T016 [US2] Create SurveyList component with grid layout in `frontend/src/components/admin/SurveyList.jsx`
- [ ] T017 [US2] Create EmptyState component for no surveys in `frontend/src/components/admin/EmptyState.jsx`
- [ ] T018 [US2] Create AdminDashboard page replacing Dashboard in `frontend/src/pages/AdminDashboard.jsx`
- [ ] T019 [US2] Implement survey list fetching with loading/error states in `frontend/src/pages/AdminDashboard.jsx`
- [ ] T020 [US2] Add "Create Survey" button linking to /surveys/new in `frontend/src/pages/AdminDashboard.jsx`
- [ ] T021 [US2] Update App.jsx routes to use AdminDashboard in `frontend/src/App.jsx`
- [ ] T022 [US2] Delete old Dashboard.jsx placeholder in `frontend/src/pages/Dashboard.jsx`

**Checkpoint**: User Story 2 complete - Dashboard displays survey list

---

## Phase 4: User Story 3 - Copy Survey URL (Priority: P0)

**Goal**: Admins can easily copy survey URLs to share

**Independent Test**: View dashboard → Click copy button on survey card → URL copied to clipboard

### Implementation for User Story 3

- [ ] T023 [US3] Add SurveyUrlCopy component to SurveyCard in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T024 [US3] Add copy success toast/tooltip feedback in `frontend/src/components/admin/SurveyUrlCopy.jsx`
- [ ] T025 [US3] Generate correct URL format {FRONTEND_URL}/s/{slug} in `frontend/src/components/admin/SurveyUrlCopy.jsx`

**Checkpoint**: User Story 3 complete - Survey URLs are copyable

---

## Phase 5: User Story 4 - View Respondents (Priority: P1)

**Goal**: Admins can see who has responded and their status

**Independent Test**: Click survey card → See respondents table with avatar, name, status

### Implementation for User Story 4

- [ ] T026 [US4] Create SurveyStats component showing response counts in `frontend/src/components/admin/SurveyStats.jsx`
- [ ] T027 [US4] Create ResponseTable component with columns in `frontend/src/components/admin/ResponseTable.jsx`
- [ ] T028 [US4] Implement status mapping (Not Started/In Progress/Completed) in `frontend/src/components/admin/ResponseTable.jsx`
- [ ] T029 [US4] Add pagination controls (10/25/50 per page) in `frontend/src/components/admin/ResponseTable.jsx`
- [ ] T030 [US4] Add search/filter by username in `frontend/src/components/admin/ResponseTable.jsx`
- [ ] T031 [US4] Create SurveyResults page in `frontend/src/pages/SurveyResults.jsx`
- [ ] T032 [US4] Fetch survey details and responses in `frontend/src/pages/SurveyResults.jsx`
- [ ] T033 [US4] Add route /surveys/:id to App.jsx in `frontend/src/App.jsx`
- [ ] T034 [US4] Add "View Responses" link to SurveyCard in `frontend/src/components/admin/SurveyCard.jsx`

**Checkpoint**: User Story 4 complete - Respondents table is viewable

---

## Phase 6: User Story 5 - Schedule Survey (Priority: P1)

**Goal**: Admins can set open/close dates for surveys

**Independent Test**: Open survey results → Set dates → Save → Status updates

### Implementation for User Story 5

- [ ] T035 [US5] Create DateTimePicker component in `frontend/src/components/admin/DateTimePicker.jsx`
- [ ] T036 [US5] Add clear button to DateTimePicker in `frontend/src/components/admin/DateTimePicker.jsx`
- [ ] T037 [US5] Add validation (closes_at after opens_at) in `frontend/src/components/admin/DateTimePicker.jsx`
- [ ] T038 [US5] Add schedule section to SurveyResults page in `frontend/src/pages/SurveyResults.jsx`
- [ ] T039 [US5] Implement save schedule with PATCH /surveys/:id in `frontend/src/pages/SurveyResults.jsx`
- [ ] T040 [US5] Add success feedback after schedule update in `frontend/src/pages/SurveyResults.jsx`

**Checkpoint**: User Story 5 complete - Survey scheduling works

---

## Phase 7: User Story 6 - Export Responses (Priority: P1)

**Goal**: Admins can export responses as JSON or CSV

**Independent Test**: Open survey results → Click export dropdown → Select format → File downloads

### Implementation for User Story 6

- [ ] T041 [US6] Create ExportDropdown component in `frontend/src/components/admin/ExportDropdown.jsx`
- [ ] T042 [US6] Implement JSON export with file download in `frontend/src/components/admin/ExportDropdown.jsx`
- [ ] T043 [US6] Implement CSV export with file download in `frontend/src/components/admin/ExportDropdown.jsx`
- [ ] T044 [US6] Add loading state during export in `frontend/src/components/admin/ExportDropdown.jsx`
- [ ] T045 [US6] Generate filename format {slug}_responses_{timestamp}.{format} in `frontend/src/components/admin/ExportDropdown.jsx`
- [ ] T046 [US6] Add ExportDropdown to SurveyResults page in `frontend/src/pages/SurveyResults.jsx`

**Checkpoint**: User Story 6 complete - Export functionality works

---

## Phase 8: User Story 7 - Duplicate Survey (Priority: P2)

**Goal**: Admins can duplicate existing surveys

**Independent Test**: Click duplicate on survey → Enter new title → New survey created

### Implementation for User Story 7

- [ ] T047 [US7] Create Modal component for dialogs in `frontend/src/components/common/Modal.jsx`
- [ ] T048 [US7] Create DuplicateModal with title input in `frontend/src/components/admin/DuplicateModal.jsx`
- [ ] T049 [US7] Implement duplicate API call POST /surveys/:id/duplicate in `frontend/src/components/admin/DuplicateModal.jsx`
- [ ] T050 [US7] Add duplicate button to SurveyCard actions in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T051 [US7] Navigate to new survey on successful duplication in `frontend/src/components/admin/DuplicateModal.jsx`

**Checkpoint**: User Story 7 complete - Survey duplication works

---

## Phase 9: User Story 8 - Delete Survey (Priority: P2)

**Goal**: Admins can delete surveys with confirmation

**Independent Test**: Click delete on survey → Confirm in modal → Survey removed from list

### Implementation for User Story 8

- [ ] T052 [US8] Create ConfirmModal component in `frontend/src/components/admin/ConfirmModal.jsx`
- [ ] T053 [US8] Add warning message about data loss in `frontend/src/components/admin/ConfirmModal.jsx`
- [ ] T054 [US8] Implement delete API call DELETE /surveys/:id in `frontend/src/components/admin/ConfirmModal.jsx`
- [ ] T055 [US8] Add delete button (trash icon) to SurveyCard in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T056 [US8] Remove survey from list on successful deletion in `frontend/src/pages/AdminDashboard.jsx`

**Checkpoint**: User Story 8 complete - Survey deletion works

---

## Phase 10: User Story 9 - Edit Metadata (Priority: P2)

**Goal**: Admins can edit survey title and description

**Independent Test**: Click edit on survey → Modify title → Save → Title updated

### Implementation for User Story 9

- [ ] T057 [US9] Create EditSurveyModal with form fields in `frontend/src/components/admin/EditSurveyModal.jsx`
- [ ] T058 [US9] Add form validation for required fields in `frontend/src/components/admin/EditSurveyModal.jsx`
- [ ] T059 [US9] Implement update API call PATCH /surveys/:id in `frontend/src/components/admin/EditSurveyModal.jsx`
- [ ] T060 [US9] Add edit button to SurveyCard actions in `frontend/src/components/admin/SurveyCard.jsx`
- [ ] T061 [US9] Add edit button to SurveyResults header in `frontend/src/pages/SurveyResults.jsx`
- [ ] T062 [US9] Update survey in list after successful edit in `frontend/src/pages/AdminDashboard.jsx`

**Checkpoint**: User Story 9 complete - Metadata editing works

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T063 [P] Add PropTypes to all new components
- [ ] T064 [P] Add focus ring styles to all new interactive elements
- [ ] T065 [P] Ensure all buttons have min 44px touch targets
- [ ] T066 Add ARIA labels to icon-only buttons (copy, delete, etc.)
- [ ] T067 Add loading skeletons to ResponseTable
- [ ] T068 Validate responsive design on mobile viewport (320px width)
- [ ] T069 Test keyboard navigation through dashboard and forms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2-4 (P0 Stories)**: Depend on Phase 1 completion
- **Phase 5-7 (P1 Stories)**: Depend on Phase 2 (AdminDashboard exists)
- **Phase 8-10 (P2 Stories)**: Depend on Phase 2 (AdminDashboard exists)
- **Phase 11 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Upload)**: Independent after Phase 1
- **US2 (Dashboard)**: Independent after Phase 1
- **US3 (Copy URL)**: Depends on US2 (needs SurveyCard)
- **US4 (View Responses)**: Depends on US2 (needs SurveyResults page)
- **US5 (Schedule)**: Depends on US4 (extends SurveyResults)
- **US6 (Export)**: Depends on US4 (extends SurveyResults)
- **US7 (Duplicate)**: Depends on US2 (needs Modal component)
- **US8 (Delete)**: Depends on US7 (shares Modal component)
- **US9 (Edit)**: Depends on US7 (shares Modal component)

### Parallel Opportunities

**Phase 1 (all parallel):**
```
T001, T002, T003, T004 can run in parallel
```

**Phase 2-3 (partial parallel):**
```
T005, T006 can run in parallel (FileUpload internals)
T013, T014, T015 can run in parallel (SurveyCard features)
```

---

## Implementation Strategy

### MVP First (P0 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: US1 (Upload)
3. Complete Phase 3: US2 (Dashboard)
4. Complete Phase 4: US3 (Copy URL)
5. **STOP and VALIDATE**: Test full survey creation flow
6. Deploy/demo if ready

### Incremental Delivery

1. P0 Stories (US1-US3) → Core admin workflow
2. P1 Stories (US4-US6) → Survey management features
3. P2 Stories (US7-US9) → Advanced admin actions
4. Polish → Final validation

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T004 | - |
| 2 | US1: Upload JSON | T005-T012 | P0 |
| 3 | US2: View Surveys | T013-T022 | P0 |
| 4 | US3: Copy URL | T023-T025 | P0 |
| 5 | US4: View Responses | T026-T034 | P1 |
| 6 | US5: Schedule | T035-T040 | P1 |
| 7 | US6: Export | T041-T046 | P1 |
| 8 | US7: Duplicate | T047-T051 | P2 |
| 9 | US8: Delete | T052-T056 | P2 |
| 10 | US9: Edit | T057-T062 | P2 |
| 11 | Polish | T063-T069 | - |

**Total Tasks**: 69
**P0 Tasks**: 22 (Setup + US1-US3)
**P1 Tasks**: 21 (US4-US6)
**P2 Tasks**: 19 (US7-US9)
**Polish Tasks**: 7

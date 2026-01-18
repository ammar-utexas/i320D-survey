<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: Initial constitution adoption (MAJOR)

Modified principles: N/A (initial version)
Added sections:
  - I. Component-First Architecture
  - II. Accessibility-First Design
  - III. Mobile-First Responsive
  - IV. Security by Default
  - V. Type Safety & Validation
  - Technical Constraints
  - Development Workflow
  - Governance

Removed sections: None (initial version)

Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (User scenarios support accessibility testing)
  - .specify/templates/tasks-template.md: ✅ Compatible (Supports phased implementation)
  - .specify/templates/checklist-template.md: ✅ Compatible (Generic structure)
  - .specify/templates/agent-file-template.md: ✅ Compatible (Generic structure)

Follow-up TODOs: None
-->

# SurveyFlow Frontend Constitution

## Core Principles

### I. Component-First Architecture

All UI functionality MUST be implemented as reusable React components following these rules:

- **Single Responsibility**: Each component handles one concern (rendering, state, or logic)
- **Props Pattern**: Components MUST destructure props with sensible defaults
- **Composition Over Inheritance**: Build complex UIs by composing smaller components
- **File Naming**: React components use `PascalCase.jsx`, hooks use `useCamelCase.js`, utils use `camelCase.js`
- **Directory Structure**: Components organized by domain (`survey/`, `admin/`, `common/`, `layout/`)

**Rationale**: Consistent component architecture enables code reuse, testability, and maintainability across the survey platform.

### II. Accessibility-First Design

Every UI component MUST meet WCAG AA accessibility standards. This is non-negotiable.

- **Color Contrast**: Minimum 4.5:1 ratio for all text
- **Focus Indicators**: Visible focus rings on ALL interactive elements
- **Form Labels**: Every input MUST have an associated label (visible or aria-label)
- **Keyboard Navigation**: All functionality MUST be keyboard accessible (Tab, Enter, Space, Arrow keys)
- **Error Announcements**: Form errors MUST be announced to screen readers
- **Touch Targets**: Minimum 44px tap targets for mobile interactions

**Rationale**: Educational platforms serve diverse users including those with disabilities. Accessibility is a legal and ethical requirement.

### III. Mobile-First Responsive

UI MUST be designed mobile-first, progressively enhancing for larger screens.

- **Breakpoint Strategy**: Start with mobile styles, use `md:` and `lg:` prefixes for tablet/desktop
- **Tailwind Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px)
- **Layout Patterns**: Stack vertically on mobile, use grids/flex on larger screens
- **Touch Optimization**: Buttons and inputs sized for finger taps on mobile
- **Performance**: Minimize layout shifts and reflows during responsive transitions

**Rationale**: Survey respondents access the platform from various devices. Mobile-first ensures core functionality works everywhere.

### IV. Security by Default

Frontend code MUST follow secure coding practices to protect user data.

- **Credentials Handling**: All API requests MUST include `credentials: 'include'` for HTTP-only cookies
- **No Token Storage**: NEVER store JWTs or sensitive data in localStorage/sessionStorage
- **XSS Prevention**: Sanitize user input before rendering; avoid injecting raw HTML into the DOM
- **CSRF Protection**: Rely on backend CSRF tokens delivered via cookies
- **Error Messages**: NEVER expose internal system details in user-facing error messages
- **Auth Redirects**: Redirect to login on 401 responses; clear local auth state on logout

**Rationale**: Survey data may contain sensitive information. Security failures undermine user trust and violate data protection requirements.

### V. Type Safety & Validation

All data boundaries MUST have explicit validation and type checking.

- **PropTypes or TypeScript**: All components MUST define expected prop types
- **API Response Validation**: Validate API responses before use; handle unexpected shapes gracefully
- **Form Validation**: Client-side validation MUST mirror backend requirements
- **Error States**: Every API call MUST handle loading, success, and error states
- **Null Safety**: Check for null/undefined before accessing nested properties

**Rationale**: Frontend is the first line of defense against bad data. Strong validation prevents runtime errors and improves user experience.

## Technical Constraints

### Technology Stack (Immutable)

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.x |
| Build Tool | Vite | Latest |
| Styling | Tailwind CSS | 3.x |
| Routing | React Router | v6 |
| HTTP Client | Fetch API | Native |
| State | React Context + hooks | Native |
| Hosting | Vercel | - |

### Coding Standards

- **No Class Components**: Use functional components with hooks exclusively
- **No Redux**: State management via Context + hooks only (per project decision)
- **No CSS-in-JS Libraries**: Tailwind utility classes only
- **No Inline Styles**: Except for dynamic values (e.g., progress bar width)
- **ESLint Compliance**: All code MUST pass linting without warnings

### Performance Targets

- **First Contentful Paint**: < 1.5s on 3G connection
- **Time to Interactive**: < 3s on 3G connection
- **Bundle Size**: Main bundle < 200KB gzipped
- **Auto-save Debounce**: 2 seconds after last change

## Development Workflow

### Code Review Requirements

All PRs MUST verify:

1. Component follows Single Responsibility principle
2. Accessibility requirements met (keyboard nav, focus states, ARIA labels)
3. Mobile-first responsive implementation
4. No security vulnerabilities (XSS, exposed credentials)
5. Prop types or TypeScript types defined
6. Error states handled for API calls

### Testing Gates

| Test Type | Requirement |
|-----------|-------------|
| Component Tests | All question type components |
| Integration Tests | Form submission flow |
| E2E Tests | Login flow, survey completion |
| Accessibility Tests | All pages pass axe-core |

### Definition of Done

A feature is complete when:

- [ ] All acceptance criteria from spec met
- [ ] Accessibility audit passes (axe-core)
- [ ] Mobile and desktop layouts verified
- [ ] Error states implemented and tested
- [ ] Code review approved
- [ ] No console errors or warnings

## Governance

This constitution supersedes all other frontend practices and conventions. Deviations require:

1. **Documentation**: Written justification for why deviation is necessary
2. **Approval**: Review and sign-off from project maintainer
3. **Migration Plan**: If temporary, include plan to return to compliance

### Amendment Process

1. Propose change via PR to this file
2. Include rationale and impact assessment
3. Update version number following semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications and typo fixes
4. Update `LAST_AMENDED_DATE` to current date

### Compliance Review

- All PRs MUST reference relevant constitution principles
- Complexity that violates principles MUST be justified in PR description
- Use `CLAUDE.md` for runtime development guidance (file paths, commands, API patterns)

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18

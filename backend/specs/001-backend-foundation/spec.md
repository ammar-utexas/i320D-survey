# Feature Specification: Backend Foundation & Authentication

**Feature Branch**: `001-backend-foundation`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Stage 1 Foundation - Backend project setup with FastAPI, database connectivity, GitHub OAuth authentication, and JWT session management"

## Clarifications

### Session 2026-01-18

- Q: How are users assigned the admin role? → A: Admins are designated manually in database (no automated promotion)
- Q: Should Stage 1 implement GitHub organization restriction? → A: Deferred to later stage (not in Stage 1 scope)
- Q: How should OAuth failures be presented to users? → A: Redirect to frontend with error query parameter (e.g., `?error=oauth_failed`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User GitHub Login (Priority: P1)

A new user wants to access the survey platform. They visit the application and click "Sign in with GitHub." The system redirects them to GitHub for authorization. After granting permission, the user is redirected back to the application, now authenticated with their GitHub identity displayed.

**Why this priority**: Authentication is the foundation for all other features. Without users being able to log in, no other functionality can be accessed. This is the critical path.

**Independent Test**: Can be fully tested by clicking "Sign in with GitHub" and verifying the user sees their GitHub avatar and username after authorization. Delivers the core value of user identity and session management.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the landing page, **When** they click "Sign in with GitHub", **Then** they are redirected to GitHub's OAuth authorization page
2. **Given** a user who has authorized the application on GitHub, **When** GitHub redirects back to the callback URL, **Then** the user's account is created (if new) or updated (if existing) and they are redirected to the frontend with an active session
3. **Given** a first-time GitHub user completing authorization, **When** they are redirected back, **Then** a new user record is created with their GitHub ID, username, email, and avatar URL

---

### User Story 2 - Returning User Session Persistence (Priority: P1)

A returning user who previously logged in opens the application in their browser. The system recognizes their existing session and automatically displays their authenticated state without requiring them to log in again.

**Why this priority**: Session persistence is essential for usability. Users should not need to re-authenticate on every page load or browser session (within token expiry).

**Independent Test**: Can be tested by logging in, closing the browser, reopening, and verifying the user remains authenticated. Delivers seamless user experience.

**Acceptance Scenarios**:

1. **Given** a user with a valid session cookie, **When** they visit the application, **Then** they are automatically recognized as authenticated
2. **Given** a user with an expired session cookie, **When** they visit the application, **Then** they are prompted to log in again
3. **Given** a user making a request, **When** the system validates their session, **Then** the user receives their profile information including username, email, and avatar

---

### User Story 3 - User Logout (Priority: P2)

An authenticated user wants to end their session. They click "Logout" and the system terminates their session, returning them to an unauthenticated state.

**Why this priority**: Logout is important for security (shared computers, privacy) but secondary to the core login functionality.

**Independent Test**: Can be tested by logging in, clicking logout, and verifying the user is no longer authenticated when accessing protected resources.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click logout, **Then** their session is terminated and they are returned to an unauthenticated state
2. **Given** a user who has logged out, **When** they try to access a protected resource, **Then** they receive an authentication error

---

### User Story 4 - System Health Verification (Priority: P2)

Operations staff need to verify the backend service is running and responsive. They access a health check endpoint that confirms the service status.

**Why this priority**: Health checks enable monitoring and deployment verification, but are not user-facing features.

**Independent Test**: Can be tested by making a request to the health endpoint and verifying a successful response.

**Acceptance Scenarios**:

1. **Given** the backend service is running, **When** a health check request is made, **Then** the system returns a healthy status
2. **Given** the backend service is deployed, **When** the deployment platform checks health, **Then** it receives confirmation the service is ready

---

### Edge Cases

- **Deleted/suspended GitHub account**: User cannot re-authenticate; existing session remains valid until expiry. No automatic account deactivation.
- **OAuth timeout/network failure**: System redirects to frontend with error query parameter (e.g., `?error=oauth_failed&reason=timeout`) for user-friendly error display.
- **Tampered/malformed JWT cookie**: System rejects the token and returns 401 Unauthorized; user must re-authenticate.
- **Database unavailable during login**: System redirects to frontend with error parameter (e.g., `?error=service_unavailable`); no partial state is persisted.
- **GitHub user with private email**: System stores `null` for email field; authentication proceeds normally since email is not required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect unauthenticated users to GitHub OAuth when they initiate login
- **FR-002**: System MUST exchange GitHub OAuth authorization codes for access tokens securely on the server side
- **FR-003**: System MUST fetch user profile information (ID, username, email, avatar) from GitHub API after successful OAuth
- **FR-004**: System MUST create a new user record when a GitHub user authenticates for the first time
- **FR-005**: System MUST update the existing user record (last login timestamp, potentially changed GitHub info) when a returning user authenticates
- **FR-006**: System MUST issue session tokens stored in HTTP-only cookies after successful authentication
- **FR-007**: System MUST validate session tokens on protected endpoints and reject invalid/expired tokens
- **FR-008**: System MUST provide an endpoint to retrieve the current authenticated user's profile
- **FR-009**: System MUST provide an endpoint to terminate user sessions (logout) by clearing session cookies
- **FR-010**: System MUST provide a health check endpoint that confirms service availability
- **FR-011**: System MUST support cross-origin requests from the frontend application with appropriate credentials handling
- **FR-012**: System MUST use database migrations to manage schema changes safely
- **FR-013**: System MUST handle OAuth tokens securely by never exposing them to the frontend
- **FR-014**: System MUST default all new users to non-admin status; admin role assignment is performed manually via direct database update (no in-app promotion mechanism in this stage)
- **FR-015**: System MUST redirect to frontend with descriptive error query parameters when OAuth flow fails (e.g., `?error=oauth_failed&reason=<cause>`)

### Key Entities

- **User**: Represents an authenticated person in the system. Contains GitHub identity (github_id, github_username), contact info (email), visual representation (avatar_url), role (is_admin flag), and temporal data (created_at, last_login_at). Identified by internal UUID. GitHub ID is the unique external identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the GitHub login flow in under 10 seconds (excluding time spent on GitHub's authorization page)
- **SC-002**: Session tokens remain valid for 24 hours without requiring re-authentication
- **SC-003**: Protected endpoints return authentication errors within 100ms when accessed without valid credentials
- **SC-004**: Health check endpoint responds successfully within 500ms
- **SC-005**: 100% of authentication attempts either succeed with a valid session or fail with a clear error message (no silent failures)
- **SC-006**: User profile information (username, avatar) displays correctly after login
- **SC-007**: System correctly handles 100% of logout requests by invalidating the session

## Out of Scope

- **GitHub Organization Restriction**: The optional `ALLOWED_GITHUB_ORGS` access control feature is deferred to a later stage. Stage 1 allows any GitHub user to authenticate.

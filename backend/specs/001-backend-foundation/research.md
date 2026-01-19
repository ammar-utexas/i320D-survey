# Research: Backend Foundation & Authentication

**Feature**: 001-backend-foundation
**Date**: 2026-01-18

## Overview

This document captures research findings and technology decisions for the backend foundation. All items from Technical Context were resolved - no NEEDS CLARIFICATION markers existed due to well-defined project constitution and delivery specifications.

## Technology Decisions

### 1. OAuth Library Selection

**Decision**: Authlib
**Rationale**:
- Native async support via httpx integration
- Battle-tested GitHub OAuth implementation
- Cleaner API than alternatives (requests-oauthlib, social-auth)
- Already specified in project constitution

**Alternatives Considered**:
- `requests-oauthlib`: Sync-only, would require async wrappers
- `social-auth-app-django`: Django-specific, not suitable for FastAPI
- Manual implementation: Higher risk of security issues

### 2. JWT Library Selection

**Decision**: python-jose with cryptography backend
**Rationale**:
- Widely used and well-maintained
- Supports HS256 algorithm specified in config
- Good error handling for token validation
- Already specified in project constitution

**Alternatives Considered**:
- `PyJWT`: Viable alternative, similar feature set
- `authlib.jose`: Could unify with OAuth library but adds complexity

### 3. Session Storage Strategy

**Decision**: Stateless JWT in HTTP-only cookies
**Rationale**:
- No server-side session store required (reduces infrastructure complexity)
- Scales horizontally without session affinity
- HTTP-only cookies prevent XSS token theft
- 24-hour expiry balances security and usability

**Alternatives Considered**:
- Server-side sessions (Redis): Adds infrastructure dependency
- localStorage JWT: XSS vulnerability, violates constitution
- Refresh token rotation: Over-engineering for this use case

### 4. Database Driver

**Decision**: asyncpg
**Rationale**:
- Native async PostgreSQL driver
- Best performance for async SQLAlchemy
- Required for SQLAlchemy 2.0 async sessions
- Already specified in project constitution

**Alternatives Considered**:
- `psycopg3`: Newer, but asyncpg has better SQLAlchemy integration
- `aiopg`: Less maintained than asyncpg

### 5. CORS Configuration

**Decision**: Single allowed origin (FRONTEND_URL)
**Rationale**:
- Credentials mode requires explicit origin (no wildcards)
- Single frontend deployment simplifies configuration
- Environment variable allows per-deployment customization

**Alternatives Considered**:
- Multiple origins list: Not needed for single frontend
- Wildcard with credentials: Not supported by browsers

### 6. Error Handling for OAuth Failures

**Decision**: Redirect to frontend with query parameters
**Rationale**:
- Keeps error display logic in frontend for consistent UX
- Standard OAuth error pattern
- Allows frontend to show localized/styled error messages
- Clarified during specification phase

**Error Parameter Format**:
```
?error=oauth_failed&reason=<cause>
?error=service_unavailable
```

## Best Practices Applied

### GitHub OAuth Flow

1. Generate state parameter for CSRF protection
2. Store state in session/cookie for callback verification
3. Exchange code for token server-side only
4. Fetch user profile after token exchange
5. Never expose access token to frontend

### JWT Cookie Security

```python
response.set_cookie(
    key="surveyflow_token",
    value=token,
    httponly=True,      # Prevent XSS access
    secure=True,        # HTTPS only (production)
    samesite="lax",     # CSRF protection
    max_age=86400,      # 24 hours
)
```

### Async Database Sessions

- Use context manager pattern for automatic cleanup
- `expire_on_commit=False` for detached object access
- Connection pooling via SQLAlchemy engine defaults

## Integration Points

### GitHub API Endpoints

| Purpose | Endpoint |
|---------|----------|
| Authorization | `https://github.com/login/oauth/authorize` |
| Token exchange | `https://github.com/login/oauth/access_token` |
| User profile | `https://api.github.com/user` |

### Environment Variables Required

| Variable | Purpose | Example |
|----------|---------|---------|
| DATABASE_URL | PostgreSQL connection | `postgresql+asyncpg://user:pass@host/db` |
| GITHUB_CLIENT_ID | OAuth app ID | `Iv1.abc123` |
| GITHUB_CLIENT_SECRET | OAuth app secret | `secret_xxx` |
| GITHUB_CALLBACK_URL | OAuth redirect | `https://api.example.com/api/v1/auth/github/callback` |
| JWT_SECRET | Token signing key | `long-random-string` |
| JWT_EXPIRY_HOURS | Token lifetime | `24` |
| JWT_COOKIE_NAME | Cookie key | `surveyflow_token` |
| FRONTEND_URL | CORS origin | `https://app.example.com` |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| GitHub API rate limiting | Cache user profile; only fetch on login |
| JWT secret compromise | Rotate secret; short expiry limits exposure |
| Database connection exhaustion | Connection pooling; async patterns |
| OAuth callback state mismatch | Clear error redirect; user can retry |

## Conclusion

All technology decisions align with the project constitution. No additional research was required beyond documenting the rationale for pre-selected technologies. The implementation can proceed to Phase 1 design.

<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (7 principles)
  - Technology Standards
  - Development Workflow
  - Governance
Removed sections: N/A (initial creation)
Templates requiring updates:
  - plan-template.md: Constitution Check section aligns with principles
  - spec-template.md: Requirements section aligns with security/validation principles
  - tasks-template.md: Phase structure supports async-first and testing principles
Follow-up TODOs: None
-->

# SurveyFlow Constitution

## Core Principles

### I. Security-First

All code MUST prioritize security. Non-negotiable requirements:

- OAuth tokens MUST be stored server-side only; NEVER expose to client
- JWTs MUST use HTTP-only cookies; NEVER localStorage/sessionStorage
- CSRF protection MUST be implemented for all state-changing operations
- All database queries MUST use parameterized queries via SQLAlchemy ORM
- User input MUST be sanitized to prevent XSS vulnerabilities
- Production deployments MUST use HTTPS exclusively
- Login attempts MUST be rate-limited to prevent brute force attacks
- Secrets (API keys, credentials) MUST NEVER be committed to version control

**Rationale**: Educational survey data requires strong protection. Security
vulnerabilities could expose student information and undermine trust.

### II. Type Safety

All code MUST be fully typed to catch errors at development time:

- Python: Type hints required on all function signatures and return types
- Pydantic v2 MUST be used for request/response validation
- SQLAlchemy models MUST use typed columns
- MyPy MUST pass with no errors before merge

**Rationale**: Type safety eliminates entire categories of runtime errors and
serves as executable documentation for API contracts.

### III. Async-First Architecture

All I/O operations MUST use async/await patterns:

- Database operations MUST use SQLAlchemy 2.0 async sessions
- External API calls (GitHub OAuth) MUST be async
- FastAPI route handlers MUST be async functions
- Connection pooling MUST be configured for database connections

**Rationale**: Survey platforms experience bursty traffic during class sessions.
Async architecture ensures the system remains responsive under load.

### IV. Testing Discipline

All features MUST include appropriate test coverage:

- Pytest MUST be used as the test framework
- Test database MUST be isolated from development/production
- Fixtures MUST manage database state and cleanup
- Integration tests MUST cover authentication flows
- Contract tests MUST verify API request/response schemas

**Rationale**: Surveys collect critical data for student pairing algorithms.
Test coverage ensures data integrity and prevents regressions.

### V. Code Quality Standards

All code MUST pass automated quality checks:

- PEP 8 compliance via Black formatter (88 character line limit)
- Linting via Ruff with no warnings
- Type checking via MyPy with strict mode
- Import ordering: stdlib, third-party, local (separated by blank lines)
- Naming: snake_case for files/functions/variables, PascalCase for classes

**Rationale**: Consistent code style reduces cognitive load during reviews and
makes the codebase accessible to future maintainers.

### VI. RESTful API Design

All endpoints MUST follow REST conventions:

- API versioning via URL prefix (/api/v1)
- Proper HTTP methods: GET (read), POST (create), PATCH (update), DELETE (remove)
- Appropriate status codes: 200 (OK), 201 (Created), 400 (Bad Request),
  401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Validation Error)
- JSON request/response bodies with Pydantic schema validation
- Consistent error response format with detail messages

**Rationale**: RESTful conventions make the API predictable and self-documenting,
reducing integration friction for frontend development.

### VII. Simplicity and YAGNI

Code MUST remain minimal and focused:

- Only implement features that are explicitly required
- Avoid premature abstraction; three similar lines are acceptable
- No feature flags or backwards-compatibility shims without justification
- Delete unused code completely; no commented-out or _unused prefixes
- Configuration via environment variables only; no complex config systems

**Rationale**: Survey platforms have well-defined scope. Over-engineering
increases maintenance burden without adding educational value.

## Technology Standards

**Language/Runtime**: Python 3.11+
**Framework**: FastAPI (async-native web framework)
**ORM**: SQLAlchemy 2.0 with async support
**Database**: PostgreSQL (via asyncpg driver)
**Migrations**: Alembic
**Authentication**: Authlib (GitHub OAuth), python-jose (JWT)
**Validation**: Pydantic v2
**Testing**: Pytest with pytest-asyncio

**Deployment**:
- Backend: Railway (Docker-based)
- Frontend: Vercel
- Database: Railway PostgreSQL

## Development Workflow

### Branch Strategy

- `main`: Production-ready code only
- `feature/*`: New functionality
- `fix/*`: Bug fixes

### Commit Messages

Conventional commits format MUST be used:
- `feat:` New functionality
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code restructuring without behavior change
- `test:` Test additions or modifications

### Pre-Merge Checklist

All PRs MUST pass before merge:
1. `black app/ tests/` (formatting)
2. `ruff check app/ tests/` (linting)
3. `mypy app/` (type checking)
4. `pytest` (all tests pass)
5. No secrets or credentials in diff

## Governance

This constitution supersedes all other development practices for the SurveyFlow
project. All code reviews MUST verify compliance with these principles.

### Amendment Process

1. Propose changes via PR modifying this constitution
2. Document rationale for changes
3. Update dependent templates if principles change
4. Version bump according to semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or material expansion
   - PATCH: Clarifications or wording improvements

### Compliance Review

- All PRs require constitution compliance verification
- Security principle violations are blocking; no exceptions
- Complexity additions require documented justification

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18

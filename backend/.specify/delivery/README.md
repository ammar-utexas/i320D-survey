# Backend Delivery Plan

This directory contains the staged delivery plan for the SurveyFlow backend API. Each stage is designed to coordinate with the corresponding frontend stage(s) for synchronized demos.

## Stage Overview

| Backend Stage | Frontend Stage(s) | Demo Capability |
|---------------|-------------------|-----------------|
| **Stage 1**: Foundation & Auth | FE Stage 1 | User signs in via GitHub, sees authenticated shell |
| **Stage 2**: Survey Public API | FE Stages 2-3 | User completes survey with auto-save |
| **Stage 3**: Admin Survey CRUD | FE Stage 4 | Admin creates surveys, shares URLs |
| **Stage 4**: Responses & Export | FE Stage 5 | Admin views responses, exports data |

## Coordination Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEMO CHECKPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CHECKPOINT 1: Authentication                                               │
│  ┌──────────────────────┐    ┌──────────────────────┐                      │
│  │ Backend Stage 1      │◄──►│ Frontend Stage 1     │                      │
│  │ - Health endpoint    │    │ - Project setup      │                      │
│  │ - GitHub OAuth       │    │ - API client         │                      │
│  │ - JWT cookies        │    │ - Auth context       │                      │
│  │ - User model         │    │ - Login page         │                      │
│  └──────────────────────┘    └──────────────────────┘                      │
│  Demo: Sign in → See avatar → Logout                                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CHECKPOINT 2: Survey Response                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐                      │
│  │ Backend Stage 2      │◄──►│ Frontend Stage 2     │                      │
│  │ - Survey model       │    │ - Question components│                      │
│  │ - Response model     │    │ - Survey form        │                      │
│  │ - Public survey API  │    │ - Survey page        │                      │
│  │ - Response upsert    │    └──────────────────────┘                      │
│  │ - Config validation  │    ┌──────────────────────┐                      │
│  └──────────────────────┘◄──►│ Frontend Stage 3     │                      │
│                              │ - Auto-save          │                      │
│                              │ - Progress bar       │                      │
│                              │ - Validation         │                      │
│                              │ - Resume response    │                      │
│                              └──────────────────────┘                      │
│  Demo: View survey → Fill answers → Auto-save → Resume later               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CHECKPOINT 3: Admin Dashboard                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐                      │
│  │ Backend Stage 3      │◄──►│ Frontend Stage 4     │                      │
│  │ - Survey CRUD        │    │ - Admin routes       │                      │
│  │ - Admin auth         │    │ - Dashboard page     │                      │
│  │ - Slug generation    │    │ - Survey list        │                      │
│  │ - Config validation  │    │ - File upload        │                      │
│  │ - Response counts    │    │ - URL display        │                      │
│  └──────────────────────┘    └──────────────────────┘                      │
│  Demo: Upload JSON → Create survey → Copy URL → Share with respondents     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CHECKPOINT 4: Data Export (Feature Complete)                               │
│  ┌──────────────────────┐    ┌──────────────────────┐                      │
│  │ Backend Stage 4      │◄──►│ Frontend Stage 5     │                      │
│  │ - Response listing   │    │ - Response table     │                      │
│  │ - Pagination/search  │    │ - Pagination         │                      │
│  │ - JSON export        │    │ - Export dropdown    │                      │
│  │ - CSV export         │    │ - Edit/delete modal  │                      │
│  │ - Statistics         │    │ - Survey stats       │                      │
│  └──────────────────────┘    └──────────────────────┘                      │
│  Demo: View responses → Search → Export CSV → Use for student pairing      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints by Stage

### Stage 1: Foundation & Auth
```
GET  /api/v1/health                    # Health check
GET  /api/v1/auth/github               # Initiate OAuth
GET  /api/v1/auth/github/callback      # OAuth callback
POST /api/v1/auth/logout               # Clear session
GET  /api/v1/auth/me                   # Current user
```

### Stage 2: Survey Public API
```
GET  /api/v1/surveys/{slug}/public     # Get survey for rendering
POST /api/v1/surveys/{slug}/respond    # Submit/update response
GET  /api/v1/surveys/{slug}/my-response # Get user's response
```

### Stage 3: Admin Survey CRUD
```
POST /api/v1/surveys                   # Create survey
GET  /api/v1/surveys                   # List admin's surveys
GET  /api/v1/surveys/{id}              # Get survey details
PATCH /api/v1/surveys/{id}             # Update survey metadata
DELETE /api/v1/surveys/{id}            # Soft-delete survey
```

### Stage 4: Responses & Export
```
GET  /api/v1/surveys/{id}/responses    # List responses (paginated)
GET  /api/v1/surveys/{id}/export       # Export CSV/JSON
GET  /api/v1/surveys/{id}/stats        # Response statistics
```

## Development Workflow

1. **Start with Stage 1** on both frontend and backend
2. Deploy to staging after each checkpoint
3. Demo combined functionality before proceeding
4. Frontend and backend can work in parallel within a stage

## Files in This Directory

- `stage-1-foundation.md` - Project setup, database, GitHub OAuth, JWT
- `stage-2-survey-public-api.md` - Survey retrieval, response submission
- `stage-3-admin-survey-crud.md` - Survey management for admins
- `stage-4-responses-export.md` - Response viewing and data export

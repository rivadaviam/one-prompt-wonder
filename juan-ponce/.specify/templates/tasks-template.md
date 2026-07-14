---
description: "Small speckit-lite task list template"
---

# Tasks: [FEATURE NAME]

**Input**: `spec.md`, `plan.md`, and optional `quickstart.md`

**Rule**: Keep this short. Build the smallest useful product first.

## Format

```text
- [ ] T001 [US1] Description with file path
```

- Use sequential IDs.
- Use `[US#]` for user-story work.
- Use `[P]` only when tasks touch unrelated files.
- Include a real file path when known.

## Phase 1: Setup

- [ ] T001 Create minimal backend/frontend folders from `plan.md`
- [ ] T002 Add backend dependencies in `backend/requirements.txt` if backend is needed
- [ ] T003 Add Vite React frontend in `frontend/` if frontend is needed

## Phase 2: Backend

- [ ] T004 [US1] Create SQLite connection in `backend/database.py`
- [ ] T005 [US1] Create SQLModel entities in `backend/models.py`
- [ ] T006 [US1] Implement FastAPI routes in `backend/app.py`
- [ ] T007 [US1] Add simple validation and readable errors in `backend/app.py`

## Phase 3: Frontend

- [ ] T008 [US1] Create API helper in `frontend/src/api.ts`
- [ ] T009 [US1] Build primary screen in `frontend/src/App.tsx`
- [ ] T010 [US1] Add simple styling in `frontend/src/styles.css`
- [ ] T011 [US1] Show loading and error states in `frontend/src/App.tsx`

## Phase 4: Validate

- [ ] T012 Write or update local run steps in `specs/[###-feature]/quickstart.md`
- [ ] T013 Run backend locally and verify main API flow
- [ ] T014 Run frontend locally and verify primary user flow
- [ ] T015 Mark completed tasks `[X]` and note any skipped scope

## Notes

- Remove backend tasks if the feature is frontend-only.
- Remove frontend tasks if the feature is backend-only.
- Add tests only when requested or when behavior is risky.
- Avoid new architecture tasks unless the constitution allows the added complexity.

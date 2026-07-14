---
name: "speckitlite-tasks"
description: "Generate a short, dependency-ordered tasks.md for the smallest useful speckit-lite product."
compatibility: "Requires speckit-lite spec.md and plan.md"
metadata:
  author: "github-spec-kit-lite"
  source: "speckit-lite"
---

## User Input

```text
$ARGUMENTS
```

Use the input as task generation guidance, especially for test depth or MVP scope.

## Workflow

1. Locate task inputs with the script:

```sh
.specify/scripts/bash/setup-tasks.sh --json --feature-dir <FEATURE_DIR>
```

   - In single-feature runs, `--feature-dir` may be omitted to use `.specify/feature.json`.
   - Parse `FEATURE_DIR`, `TASKS_TEMPLATE`, and `AVAILABLE_DOCS`.
2. Read `spec.md`, `plan.md`, `quickstart.md`, and any useful available artifacts: `data-model.md`, `contracts/`.
3. Create `tasks.md` from `.specify/templates/tasks-template.md` when available; otherwise create a compact task list with:
   - Setup
   - Backend
   - Frontend
   - Validation
4. Every task must use this format:

```text
- [ ] T001 [P] [US1] Description with file path
```

Rules:
- Keep IDs sequential.
- Use `[P]` only for tasks that can run in parallel.
- Use `[US#]` only for user-story tasks.
- Include exact file paths where files are known.
- Add test tasks only when requested by the spec/user or needed for risky behavior.
- Make each user story independently implementable and testable.
- Prefer the default files from the plan: `backend/app.py`, `backend/models.py`, `backend/database.py`, `frontend/src/App.tsx`, `frontend/src/api.ts`, and `frontend/src/styles.css`.
- Do not add architecture, infrastructure, or polish tasks unless required for the smallest useful product.

## Completion Report

Report:
- `tasks.md` path
- Total task count
- Task count per phase
- Suggested MVP scope
- Suggested next skill: `speckitlite-implement`

## Done When

- `tasks.md` is executable by an implementation agent.
- Tasks are ordered by dependency and grouped by setup/backend/frontend/validation.
- Each task has an ID, checkbox, and concrete action.

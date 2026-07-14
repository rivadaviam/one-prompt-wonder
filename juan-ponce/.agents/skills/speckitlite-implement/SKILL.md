---
name: "speckitlite-implement"
description: "Implement the smallest useful speckit-lite product by executing tasks.md and marking completed tasks."
compatibility: "Requires speckit-lite tasks.md"
metadata:
  author: "github-spec-kit-lite"
  source: "speckit-lite"
---

## User Input

```text
$ARGUMENTS
```

Use the input as execution scope. If the user asks for a subset, implement only that subset.

## Workflow

1. Locate implementation inputs with the script:

```sh
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks --feature-dir <FEATURE_DIR>
```

   - In single-feature runs, `--feature-dir` may be omitted to use `.specify/feature.json`.
   - Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.
2. Read `tasks.md`, `plan.md`, `spec.md`, and any relevant supporting artifacts.
3. Check feature checklists if present. If incomplete items remain, show a short status and ask whether to proceed.
4. Inspect the codebase before editing. Follow existing patterns, but keep the constitution defaults unless the plan explicitly overrides them.
5. Execute tasks in order:
   - Complete setup first.
   - Build backend with FastAPI + SQLite + SQLModel when backend exists.
   - Build frontend with Vite React, local state, and a small API helper when frontend exists.
   - Run test tasks before dependent implementation tasks when present.
   - Respect `[P]` only when tasks touch independent files.
   - Mark each completed task as `[X]` in `tasks.md`.
6. Validate with quickstart steps first, then tests/linters/build commands when available.
7. Stop and report clearly if a task is blocked by missing requirements, failing prerequisites, or user approval.

## Completion Report

Report:
- Tasks completed and remaining
- Files changed
- Validation commands run and results
- Any blockers or follow-up work

## Done When

- Requested tasks are implemented.
- Completed tasks are marked `[X]`.
- Validation has been run or the reason it could not run is stated.

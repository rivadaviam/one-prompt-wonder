---
name: "speckitlite-plan"
description: "Create a concise speckit-lite implementation plan using the beginner default stack and smallest useful architecture."
compatibility: "Requires a speckit-lite spec created by speckitlite-specify"
metadata:
  author: "github-spec-kit-lite"
  source: "speckit-lite"
---

## User Input

```text
$ARGUMENTS
```

Use the input as planning constraints or preferences.

## Workflow

1. Locate and prepare the feature plan with the script:

```sh
.specify/scripts/bash/setup-plan.sh --json --feature-dir <FEATURE_DIR>
```

   - In single-feature runs, `--feature-dir` may be omitted to use `.specify/feature.json`.
   - Parse `FEATURE_SPEC` and `IMPL_PLAN` from the JSON output.
2. Read `spec.md` and `.specify/memory/constitution.md`. If the constitution is missing, ask the user to run `speckitlite-constitution` first.
3. Create `plan.md` from `.specify/templates/plan-template.md` when available; otherwise create a minimal plan with:
   - Summary
   - Speckit-Lite Defaults
   - Technical Context
   - Project Structure
   - Implementation Phases
   - Local Validation
4. Apply constitution defaults:
   - Backend: FastAPI + SQLite + SQLModel when backend exists.
   - Frontend: Vite React + TypeScript + local state when frontend exists.
   - Use direct, beginner-readable files and avoid extra architecture.
5. Create `quickstart.md` for local validation.
6. Create optional artifacts only when they reduce implementation confusion:
   - `data-model.md` only for more than two entities.
   - `contracts/` only for external API consumers.
   - Avoid `research.md` unless a constitution default is explicitly overridden.
7. Resolve planning unknowns pragmatically. Send unresolved product ambiguity back to `speckitlite-clarify`.

## Completion Report

Report:
- Plan path
- Generated artifacts
- Any constitution default overridden and why
- Blocking unresolved decisions, if any
- Suggested next skill: `speckitlite-tasks`

## Done When

- `plan.md` exists.
- `quickstart.md` exists.
- Remaining blockers are explicit.

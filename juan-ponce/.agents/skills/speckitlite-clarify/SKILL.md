---
name: "speckitlite-clarify"
description: "Clarify, verify, and lightly polish the active speckit-lite feature spec before planning."
compatibility: "Requires a spec-kit-lite feature spec under specs/"
metadata:
  author: "github-spec-kit-lite"
  source: "speckit-lite"
---

## User Input

```text
$ARGUMENTS
```

Use the input as extra context for clarification.

## Workflow

1. Locate the feature directory.
   - Prefer an explicit `FEATURE_DIR` from the orchestrator or prompt.
   - Otherwise read `.specify/feature.json`.
   - For path-only validation, use `.specify/scripts/bash/check-prerequisites.sh --json --paths-only --feature-dir <dir>`.
2. Read `spec.md` and, if present, `.specify/memory/constitution.md`.
3. Scan for high-impact ambiguity and lite-fit issues in:
   - Scope and exclusions
   - User roles and permissions
   - Core data or entities
   - Critical user flows and error cases
   - Security, privacy, compliance, or measurable success criteria
   - Whether the feature fits the small-product constitution defaults
4. Ask up to 5 questions total, one at a time.
   - Prefer multiple choice with a recommended option.
   - Accept "yes", "recommended", or the option letter.
   - Use short-answer questions only when choices would be artificial.
   - In orchestrated unattended runs, choose the recommended/simple option without asking the user.
5. After each accepted answer:
   - Add or update `## Clarifications` with `### Session YYYY-MM-DD`.
   - Append `- Q: <question> -> A: <answer>`.
   - Update the relevant spec section so the clarification is part of the requirements.
   - Remove contradictions and resolved `[NEEDS CLARIFICATION: ...]` markers.
6. Create or update `checklists/requirements.md` using `.specify/templates/checklist-template.md` when available.
   - Verify the spec is small, clear, locally runnable, and aligned with the constitution.
   - Mark checklist items based on the updated spec.
   - Keep notes short and practical.

## Completion Report

Report:
- Questions answered
- Updated spec path
- Sections changed
- Checklist status
- Remaining unresolved or over-scoped items, if any
- Suggested next skill: `speckitlite-plan`

## Done When

- Accepted answers are integrated into `spec.md`.
- No newly answered ambiguity remains as a placeholder.
- `checklists/requirements.md` reflects current spec readiness.

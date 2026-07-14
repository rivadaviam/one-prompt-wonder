---
name: "speckitlite-specify"
description: "Create a short speckit-lite feature specification from a natural language feature request."
compatibility: "Requires a spec-kit-lite project structure with .specify/ directory"
metadata:
  author: "github-spec-kit-lite"
  source: "speckit-lite"
---

## User Input

```text
$ARGUMENTS
```

Use the user input as the feature description. If it is empty, stop and ask for a feature description.

## Workflow

1. Create or locate the feature directory.
   - If the orchestrator provided `FEATURE_DIR`, use that directory and set `SPEC_FILE` to `<FEATURE_DIR>/spec.md`.
   - Otherwise create the feature directory with the script:

```sh
.specify/scripts/bash/create-new-feature.sh --json "<feature description>"
```

   - In orchestrated parallel runs where the directory has not been created yet, use `--no-persist --ticket-id <id> --short-name <name>` so `.specify/feature.json` is not shared across agents.
   - Parse `FEATURE_DIR` and `SPEC_FILE` from the JSON output when the script is used.
2. Create or update `spec.md` from `.specify/templates/spec-template.md` when available; otherwise create a minimal spec with these sections:
   - Feature Summary
   - User Scenarios
   - Functional Requirements
   - Success Criteria
   - Assumptions
   - Key Entities, only if relevant
4. Fill the spec with user-focused WHAT and WHY. Do not include implementation details.

## Completion Report

Report:
- Feature directory
- Spec file path
- Suggested next skill: `speckitlite-clarify`

## Done When

- `spec.md` exists and follows the template or minimal structure.
- `.specify/feature.json` points to the feature directory for single-feature runs, or the orchestrator passed `FEATURE_DIR` explicitly for parallel runs.

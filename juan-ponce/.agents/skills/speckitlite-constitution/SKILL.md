---
name: "speckitlite-constitution"
description: "Create or update the short speckit-lite project constitution, setting simple beginner stack rules before feature work starts."
compatibility: "Requires a spec-kit-lite project structure with .specify/ directory"
metadata:
  author: "github-spec-kit-lite"
  source: "speckit-lite"
---

## User Input

```text
$ARGUMENTS
```

Use the input as project idea context plus any requested principle, stack, or governance changes. This skill runs at the beginning of a speckit-lite project before `speckitlite-specify`.

## Workflow

1. Open `.specify/memory/constitution.md`.
   - If missing, create it from `.specify/templates/constitution-template.md` when available.
   - If no template exists, create a concise constitution with Principles, Governance, and Version.
2. Replace placeholders with concrete project rules.
   - Infer reasonable values from repo context and user input.
   - Use `TODO(<FIELD>)` only when a required governance value cannot be inferred.
3. Apply the speckit-lite defaults unless the user explicitly overrides them:
   - Small projects only. Done is better than perfect.
   - Backend MUST be a simple FastAPI app with SQLite and SQLModel.
   - Backend MUST use direct route -> function/service -> database flow. No repository pattern, event bus, microservices, or background job system unless the idea truly cannot work without it.
   - Frontend MUST be a Vite React app with simple pages, components, local state, and a tiny API client.
   - Frontend MUST avoid complex state managers, design systems, routing trees, and generated clients unless required.
4. Keep principles short, testable, and directive.
   - Prefer MUST for non-negotiable rules.
   - Use SHOULD only when exceptions are valid and obvious.
5. Update governance metadata.
   - `RATIFICATION_DATE`: preserve existing date when known.
   - `LAST_AMENDED_DATE`: today when changes are made.
   - `CONSTITUTION_VERSION`: bump semver.
     - MAJOR for incompatible principle changes.
     - MINOR for added or materially expanded principles.
     - PATCH for clarifications and wording.
6. Lightly align local templates when the constitution changes requirements:
   - `.specify/templates/spec-template.md`
   - `.specify/templates/plan-template.md`
   - `.specify/templates/tasks-template.md`
7. Add a short sync report as an HTML comment at the top of the constitution:
   - Version change
   - Principles changed
   - Templates updated or pending
   - Deferred TODOs

## Completion Report

Report:
- Constitution path
- Version change and bump reason
- Templates touched
- Remaining TODOs, if any
- Suggested next skill: `speckitlite-specify`

## Done When

- `.specify/memory/constitution.md` is updated.
- No unexplained bracket placeholders remain.
- Changed principles are reflected in relevant templates.

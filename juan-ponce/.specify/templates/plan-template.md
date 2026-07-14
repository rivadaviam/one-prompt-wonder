# Implementation Plan: [FEATURE]

**Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `speckitlite-plan` skill.

## Summary

[One paragraph: what will be built and the smallest useful outcome.]

## Speckit-Lite Defaults

**Project Size**: Small project only. Done is better than perfect.

**Backend**: FastAPI + SQLite + SQLModel.

**Backend Architecture**: `backend/app.py` or `backend/main.py`, route functions, small helper/service functions, direct SQLModel database access.

**Frontend**: Vite + React + TypeScript.

**Frontend Architecture**: simple pages/components, local state, `src/api.ts` for backend calls, plain CSS.

**Avoid Unless Required**: repository pattern, microservices, event bus, queue workers, global frontend state managers, generated API clients, large design systems, complex routing.

## Technical Context

**Feature Type**: [backend only / frontend only / full stack]

**Backend Needed**: [yes/no and why]

**Frontend Needed**: [yes/no and why]

**Storage**: SQLite local database unless not needed.

**Data Model**: [small list of entities or "none"]

**Validation**: [manual quickstart, tests if requested/high risk]

## Constitution Check

- [ ] Smallest useful product identified
- [ ] FastAPI + SQLite + SQLModel used for backend if backend exists
- [ ] Vite React used for frontend if frontend exists
- [ ] No unnecessary architecture added
- [ ] Local run/validation path is clear

## Project Structure

Use only the folders the feature needs.

```text
backend/
├── app.py
├── models.py
├── database.py
└── requirements.txt

frontend/
├── package.json
├── index.html
└── src/
    ├── App.tsx
    ├── api.ts
    └── styles.css

specs/[###-feature]/
├── spec.md
├── plan.md
├── tasks.md
└── quickstart.md
```

## Implementation Phases

1. Create the minimal project structure.
2. Build the backend data model and endpoints.
3. Build the frontend UI and API calls.
4. Add simple validation and error handling.
5. Run the quickstart and fix only blocking issues.

## Artifacts

Create only what helps implementation:

- `plan.md`: required
- `tasks.md`: created by `speckitlite-tasks`
- `quickstart.md`: required for local validation
- `data-model.md`: optional, only if more than two entities
- `contracts/`: optional, only if external API consumers need it

## Complexity Notes

If anything exceeds the defaults, explain it here:

| Added Complexity | Why Needed | Simpler Option Rejected |
|------------------|------------|-------------------------|
| [none by default] | | |

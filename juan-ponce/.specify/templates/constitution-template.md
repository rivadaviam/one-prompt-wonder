# [PROJECT_NAME] Speckit-Lite Constitution

<!--
Sync Impact Report
Version change: N/A -> [CONSTITUTION_VERSION]
Principles changed: initial speckit-lite defaults
Templates updated: spec-template.md, plan-template.md, tasks-template.md
Deferred TODOs: [TODO_ITEMS_OR_NONE]
-->

## Core Principles

### I. Small Product First

This project MUST aim for the smallest useful product that satisfies the idea. Done is better than perfect. Every feature MUST have a visible user outcome, and non-essential polish, extensibility, automation, and abstractions MUST be deferred until the product works.

### II. Beginner Backend

Backend work MUST use a simple FastAPI app with SQLite and SQLModel. The default architecture is route -> function/service -> database. Avoid repository patterns, service meshes, message queues, event buses, plugin systems, background workers, and microservices unless a requirement cannot work without them.

### III. Beginner Frontend

Frontend work MUST use a Vite React app with plain components, local state, simple pages, and one small API client. Avoid complex state managers, generated clients, large design systems, deep routing trees, and premature component libraries.

### IV. One Repo, Few Folders

Projects MUST stay in one repository with obvious folders: `backend/`, `frontend/`, and `docs/` only when needed. Files SHOULD be named for what they do. Prefer one clear file over many tiny abstractions.

### V. Manual-Friendly Validation

Each feature MUST include a quick way to run and check it locally. Automated tests are welcome, but the minimum validation is a short `quickstart.md` or task note with commands and expected results.

## Default Stack

The constitution skill runs first and sets these defaults for the rest of the speckit-lite flow:

- Backend: Python, FastAPI, SQLite, SQLModel, pytest only when tests are requested or risk is high.
- Frontend: Vite, React, TypeScript, plain CSS or a tiny local stylesheet.
- Data: local SQLite by default.
- Auth: skip unless the idea explicitly needs users. If users are required, use the simplest local email/password or demo user flow.
- Deployment: local-first. Add deployment only when requested.

## Development Workflow

Build in this order:

1. Constitution sets stack and architecture defaults.
2. Specify captures the smallest useful feature.
3. Clarify polishes the spec and removes ambiguity.
4. Plan chooses the simplest file structure.
5. Tasks create a short checklist.
6. Implement completes the checklist and validates locally.

## Governance

This constitution overrides conflicting template suggestions. Any added complexity MUST explain why the simple default is insufficient. Amendments use semantic versioning: MAJOR for incompatible rule changes, MINOR for new principles or stack changes, PATCH for wording clarifications.

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]

# Speckit-Lite Checklist: [FEATURE NAME]

**Purpose**: Keep the feature small, clear, and locally runnable.
**Created**: [DATE]
**Feature**: [Link to spec.md]

## Product Fit

- [ ] Smallest useful product is clear
- [ ] Primary user flow is on the first screen or first API path
- [ ] Out-of-scope items are listed

## Architecture Fit

- [ ] Backend uses FastAPI + SQLite + SQLModel when backend exists
- [ ] Frontend uses Vite React with local state when frontend exists
- [ ] No unnecessary repository pattern, microservice, queue, global state manager, or generated client

## Validation

- [ ] Local run steps are documented
- [ ] Primary flow can be manually verified
- [ ] Remaining TODOs are explicit

---
description: "Small speckit-lite task list"
---

# Tasks: Banh Mi Vietnam Replica

**Input**: `spec.md`, `plan.md`, and `quickstart.md`

**Rule**: Keep this short. Build the smallest useful product first.

## Phase 1: Setup

- [X] T001 Create or verify the minimal Vite React TypeScript structure in `frontend/`
- [X] T002 Add or verify Vite React TypeScript dependencies and scripts in `frontend/package.json`
- [X] T003 [P] Add or verify the app entry point imports the stylesheet in `frontend/src/main.tsx`

## Phase 2: Static Page Content

- [X] T004 [US1] Build the one-page section structure and static content arrays in `frontend/src/App.tsx`
- [X] T005 [US1] Add the hero content, pronunciation, description, call to action, and desktop section navigation in `frontend/src/App.tsx`
- [X] T006 [US1] Add the story timeline milestones for The arrival, The rebirth, and Global recognition in `frontend/src/App.tsx`
- [X] T007 [US3] Add the anatomy ingredient labels in `frontend/src/App.tsx`
- [X] T008 [US3] Add the fillings highlights and street footer content in `frontend/src/App.tsx`

## Phase 3: Interaction and Styling

- [X] T009 [US2] Add mobile menu state and same-page anchor link behavior in `frontend/src/App.tsx`
- [X] T010 [US1] Style the hero, section rhythm, timeline, anatomy area, fillings section, and footer in `frontend/src/styles.css`
- [X] T011 [US2] Add responsive navigation and mobile layout rules in `frontend/src/styles.css`
- [X] T012 [US1] Add local recreated visual accents or CSS illustrations for the sandwich/street theme in `frontend/src/styles.css`

## Phase 4: Validate

- [X] T013 Run `npm run dev` from `frontend/` and verify all required sections manually using `specs/001-banh-mi-vietnam-replica/quickstart.md`
- [X] T014 Run `npm run build` from `frontend/` and fix any TypeScript or build errors
- [X] T015 Check mobile and desktop viewport widths for readable text, usable navigation, and no incoherent overlap
- [X] T016 Mark completed tasks `[X]` in `specs/001-banh-mi-vietnam-replica/tasks.md` and note any intentionally skipped scope

## Notes

- No backend tasks are included because this feature is static and frontend-only.
- Add automated tests only if implementation introduces risky behavior beyond static layout and anchor navigation.

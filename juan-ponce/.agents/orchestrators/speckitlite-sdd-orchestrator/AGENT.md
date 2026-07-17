---
name: "speckitlite-sdd-orchestrator"
description: "Orchestrate a full speckit-lite SDD MVP from one project idea using parallel artifact agents and stacked implementation PRs."
---

# Speckit-Lite SDD Orchestrator

You turn one project idea into a tiny MVP that should be usable in about 15-20 minutes of build time. Treat every request as a beginner-friendly, small, local-first product unless the user explicitly says otherwise.

## Core Rules

- Always create a new git branch before changing project artifacts.
- Always run `speckitlite-constitution` first to set the stack, libraries, technology choices, and architecture rules.
- Default stack: FastAPI + SQLite + SQLModel backend, Vite React + TypeScript frontend, local state, plain CSS, one repo.
- Prefer done over perfect. Keep scope small enough to finish.
- Use scripts from `.specify/scripts/bash/` whenever they can reduce agent work or coordinate state.
- Use sub-agents only for SDD artifact generation: specs, clarify, plans, and tasks.
- Do not use sub-agents for implementation. Implementation is the orchestrator's responsibility in the main agent.
- Never ask the user clarification questions during orchestrated runs. For clarification choices, select the recommended/simple option and write it into the spec.
- Keep all feature work isolated by explicit `FEATURE_DIR`; do not rely on one shared `.specify/feature.json` during parallel artifact work.
- Commit after every completed orchestration stage. Small commits are part of the workflow, not optional cleanup.
- Do not merge PRs. Create PRs and continue the stack.

## Required Scripts

Use these scripts as the filesystem and coordination layer:

- `.specify/scripts/bash/create-ticket-batch.sh`
- `.specify/scripts/bash/claim-ticket.sh`
- `.specify/scripts/bash/create-new-feature.sh`
- `.specify/scripts/bash/setup-plan.sh`
- `.specify/scripts/bash/setup-tasks.sh`
- `.specify/scripts/bash/check-prerequisites.sh`
- `.specify/scripts/bash/stack-branch-plan.sh`

## End-to-End Flow

### 1. Start Branch

Create a branch from `main` or the repo default branch:

```sh
git fetch origin
git switch main
git pull --ff-only
git switch -c sdd/<short-project-slug>
```

If `main` does not exist locally, discover the default branch with `git remote show origin`.

### 2. Constitution

Run `speckitlite-constitution` on the global project idea. The constitution must set:

- backend stack and architecture
- frontend stack and architecture
- data/storage choice
- validation style
- explicit simplicity rules

Do this before ticket splitting so every downstream artifact inherits the same constraints.

Commit immediately after the constitution is created or updated:

```sh
git add .specify/memory/constitution.md .specify/templates .agents/skills/speckitlite-constitution
git commit -m "Set speckit-lite constitution"
```

### 3. Split The Global Idea Into Tickets

Create a small ticket list from the project idea.

Rules:

- 2-5 tickets for most MVPs.
- Each ticket must produce a visible or testable product slice.
- Prefer vertical slices over architecture-only tickets.
- Keep dependencies obvious and sequential.
- Use names that become readable feature directory names.

Write the ticket list to a temporary JSONL file:

```jsonl
{"id":"T001","title":"Todo CRUD","description":"Create, list, update, and delete todos with local persistence"}
{"id":"T002","title":"User manager","description":"Create local users and assign todos to users"}
```

Then run:

```sh
.specify/scripts/bash/create-ticket-batch.sh --json --goal "<global idea>" --tickets-file <tickets.jsonl>
```

Parse `BATCH_ID`, `BATCH_DIR`, `TICKETS_JSONL`, and `AGENTS_DIR`.

### 4. Parallel Specs

Spawn one worker sub-agent per ticket to run `speckitlite-specify`.

Each worker receives:

- the global idea
- the ticket id/title/description
- the explicit `FEATURE_DIR`
- instruction to edit only that feature directory
- instruction not to change `.specify/feature.json`

Workers must fill `spec.md` only. They must not plan, task, implement, commit, or branch.

After all spec workers finish, review the changed `specs/` files and commit:

```sh
git add specs .specify/orchestration
git commit -m "Add speckit-lite specs"
```

### 5. Unattended Clarify

After all specs exist, run `speckitlite-clarify` for each feature.

This may be parallelized with sub-agents because each feature directory is disjoint. For every clarification question:

- pick the recommended/simple option
- do not ask the user
- write the answer into `spec.md`
- create/update `checklists/requirements.md`

After all specs are clarified and polished, commit:

```sh
git add specs
git commit -m "Clarify speckit-lite specs"
```

### 6. Parallel Plans

Spawn one worker sub-agent per clarified spec to run `speckitlite-plan`.

Each worker must call:

```sh
.specify/scripts/bash/setup-plan.sh --json --feature-dir <FEATURE_DIR>
```

Workers must create:

- `plan.md`
- `quickstart.md`
- optional `data-model.md` only when helpful
- optional `contracts/` only when external consumers need it

Workers must not implement, commit, or branch.

After all plan workers finish, commit:

```sh
git add specs
git commit -m "Add speckit-lite plans"
```

### 7. Parallel Tasks

Spawn one worker sub-agent per planned spec to run `speckitlite-tasks`.

Each worker must call:

```sh
.specify/scripts/bash/setup-tasks.sh --json --feature-dir <FEATURE_DIR>
```

Workers must create `tasks.md` only for their feature directory. Keep tasks short and executable.

After all task workers finish, commit:

```sh
git add specs
git commit -m "Add speckit-lite tasks"
```

### 8. Artifact PR

When every ticket has `spec.md`, `plan.md`, and `tasks.md`:

```sh
git status --short
git push -u <remote> sdd/<short-project-slug>
gh pr create --base main --head <branch> --title "Add SDD artifacts for <project>" --body "<summary>"
```

If direct push to `origin` is denied, push to the user fork remote and open the PR from there.

Do not stop after the PR. Continue implementation from this branch without merging it.

## Stacked Implementation Flow

Implementation happens in the main orchestrator agent, not in sub-agents.

For each ticket in dependency order:

1. Generate the stack plan:

```sh
.specify/scripts/bash/stack-branch-plan.sh --json --batch-id <BATCH_ID> --artifact-branch sdd/<short-project-slug>
```

2. For each stack entry, use its `base`, `branch`, and `feature_dir`.
3. Set the current base branch:
   - first ticket base is the artifact branch
   - next ticket base is the previous implementation branch
4. Create a new branch from the current base:

```sh
git switch <base-branch>
git switch -c impl/<ticket-id>-<short-name>
```

5. Run `speckitlite-implement` for that ticket with explicit `FEATURE_DIR`.
6. Use:

```sh
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks --feature-dir <FEATURE_DIR>
```

7. Implement all tasks in `tasks.md`.
8. Mark completed tasks `[X]`.
9. Commit incremental progress after each solid logic block:
   - data model/database setup
   - backend endpoint group
   - frontend screen/API integration
   - validation/error handling
   - task checklist updates

Use specific messages:

```sh
git add .
git commit -m "Implement <ticket-id> backend foundation"
git commit -m "Implement <ticket-id> primary UI"
git commit -m "Validate <ticket-id> flow"
```

Do not wait until the end of a large ticket to commit if a coherent block is working.

10. Run quickstart validation and any relevant tests/builds.
11. Ensure there is a final implementation commit before creating the PR. If the working tree is clean because the incremental commits already captured everything, do not create an empty commit. If final validation or task marks changed files, commit them:

```sh
git add .
git commit -m "Complete <ticket-id> <short-name>"
```

12. Push and create a PR:

```sh
git push -u <remote> impl/<ticket-id>-<short-name>
gh pr create --base <base-branch> --head <branch> --title "Implement <ticket-id>: <title>" --body "<summary>"
```

13. Continue immediately to the next ticket. The next implementation branch must be created from the current ticket branch, forming a stack.

## Branch Stack Example

```text
main
└── sdd/todo-user-manager
    └── impl/T001-todo-crud
        └── impl/T002-user-manager
            └── impl/T003-polish-local-validation
```

Each branch gets its own PR. Do not wait for merge before continuing.

## Sub-Agent Prompts

Spec worker prompt:

```text
Use skill speckitlite-specify.
Global idea: <global idea>
Ticket: <id> <title>
Description: <description>
FEATURE_DIR: <feature dir>
Edit only this feature directory. Do not touch .specify/feature.json. Do not plan, task, implement, commit, or branch.
```

Clarify worker prompt:

```text
Use skill speckitlite-clarify.
FEATURE_DIR: <feature dir>
Run unattended. For every clarification question, choose the recommended/simple option. Do not ask the user. Update spec.md and checklists/requirements.md only.
```

Plan worker prompt:

```text
Use skill speckitlite-plan.
FEATURE_DIR: <feature dir>
Call setup-plan.sh with --feature-dir. Create plan.md and quickstart.md. Keep defaults simple. Do not implement, commit, or branch.
```

Tasks worker prompt:

```text
Use skill speckitlite-tasks.
FEATURE_DIR: <feature dir>
Call setup-tasks.sh with --feature-dir. Create tasks.md only. Keep tasks short and executable. Do not implement, commit, or branch.
```

## Done When

- The SDD artifact branch PR exists.
- The artifact branch contains separate commits for constitution, specs, clarified specs, plans, and tasks.
- Each ticket implementation branch exists and has a PR.
- Each implementation branch contains incremental commits for meaningful progress plus a final completion commit when needed.
- Branches form a stack in ticket order.
- The final branch contains the complete MVP.
- No PRs are merged by the orchestrator.

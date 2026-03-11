---
name: next-plan-phase
description: Implement the next minor phase of an active plan. Use when the user wants to continue plan-driven implementation one phase at a time.
---

## Workflow

### Step 1: Resolve the target plan

- If a plan file is specified as an argument, use that plan.
- If no plan is specified:
  - List all `.plan.md` files in `.claude/plans/` (excluding `completed/` and `archived/` subdirectories).
  - If exactly one plan exists, use it automatically and state which plan was selected.
  - If multiple plans exist, list them and ask the user to select one before proceeding.

### Step 2: Identify the next minor phase

Read the plan and find the **first incomplete minor phase** — the lowest-numbered sub-phase (e.g. `1.1`, `2.3`) that contains at least one unchecked task (`[ ]`).

- A minor phase is a numbered sub-section such as `1.1`, `1.2`, `2.1`, etc.
- Skip any minor phase where all tasks are already marked complete (`[✓]`).
- If all phases are complete, inform the user and stop.

### Step 3: Implement the phase

Implement **only** the identified minor phase. Do not implement any subsequent phases.

Follow all guidelines in `.claude/rules/` throughout implementation, including:
- Running `npm run lint:fix` after implementation
- Verifying with Wallaby MCP after any code changes (`wallaby_failingTests`)
- Using WebStorm MCP to verify code correctness after changes

### Step 4: Update the plan

As each task within the phase is completed, mark it `[✓]` in the plan file. When the entire minor phase is done, mark the minor phase itself `[✓]`.

Update the **Status** line in the Overview section to reflect the phase just completed (e.g. `Phase 1.2 Complete`).

Do not remove any tasks — only check them off.

### Step 5: Report

State clearly:
- Which phase was implemented
- A brief summary of what was done
- What the next phase will be (so the user knows what to expect on the next invocation)

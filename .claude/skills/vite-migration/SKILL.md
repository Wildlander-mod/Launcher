---
name: vite-migration
description: Implement the next task from the Wildlander launcher's migration-to-Vite plan. Use this skill whenever the user asks to continue the Vite migration, asks what's next in the migration, wants to implement a migration step, or says something like "next migration task", "continue the migration", "what's left to migrate", or "do the next Vite step". The migration plan lives in Obsidian, not in .claude/plans/.
---

## Context

The migration plan is tracked in the Obsidian vault at:
`~/workspace/personal/obsidian/launcher/Migration to Vite.md`

This file is the single source of truth for all outstanding migration tasks. It is **not** in `.claude/plans/` — always read it from the Obsidian path above.

## Workflow

### Step 1: Read the migration plan

Read `~/workspace/personal/obsidian/launcher/Migration to Vite.md` in full.

### Step 2: Identify the next task

Find the **first unchecked item** (`- [ ]`) in document order, working phase by phase. Skip:
- Items marked `- [x]` (already done)
- **Verify** bullet points (these are checkpoints, not standalone tasks — they get checked after the tasks above them pass)

If there is an active phase with multiple unchecked items, implement **only the first unchecked item** in that phase, then stop. This keeps each step small and verifiable.

If all items are checked, inform the user and stop.

### Step 3: Implement the task

Implement the identified task following all project conventions in `.claude/rules/`:
- Run `npm run lint:fix` after code changes
- Run `wallaby_failingTests` after any code changes to catch regressions
- Use WebStorm MCP to verify correctness after changes

If the task has a **Verify** bullet immediately below it (within the same step/phase), run that verification too — and check the verify bullet off once it passes.

### Step 4: Mark as done in Obsidian

After successful implementation, update `~/workspace/personal/obsidian/launcher/Migration to Vite.md`:
- Change `- [ ]` → `- [x]` for the completed task
- If a **Verify** checkpoint was also completed, check that off too

Do **not** remove any items — only check them off.

### Step 5: Report

State clearly:
- Which task was implemented and in which phase/step
- A brief summary of what was changed
- What the next unchecked task will be (so the user knows what's coming)

# Planning Guidelines

## When to Plan

- **Default: proceed directly to implementation** unless a plan is explicitly requested
- When a plan is requested: create it, perform Current State Analysis (existing code, issues, structure), then **STOP and wait for explicit approval** before implementing

## Plan Files

- Store plans in `.claude/plans/[name].plan.md` (kebab-case, `.plan.md` extension required)
- Commit plan creations and changes to git
- On completion → move to `.claude/plans/completed/`; on abandonment → move to `.claude/plans/archived/` (both are gitignored)
- For structure/formatting, see `.claude/templates/plan.template.md`

## Keeping Plans Accurate

- **Never remove completed items** — only check them off
- **Iterating on an existing plan**: update the original, do not create a new one
- **When updating multiple phases**: update the plan alongside each phase, not all at the end
- **Before committing**: ensure the plan accurately reflects what is being committed
- **When fixing/refactoring previously planned code**: update the associated plan to reflect the changes

## Implementation Rules

- **When told to continue**: implement only the next minor phase (e.g. 2.1, not all of phase 2)
- When code will be modified in a later phase, add a comment explaining this; remove it after the planned change
- Run `npm run lint:fix` after each implementation block and fix any issues
- Run tests after each change to catch regressions early

## Testing

- All e2e test IDs must be abstracted as `static readonly` page object class properties
- Existing tests must continue to pass; cover edge cases and error scenarios

## Documentation Formatting

- Always include a bullet point list of steps above code blocks; do not embed code inside bullet lists

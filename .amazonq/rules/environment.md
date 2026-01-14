# Environment Guidelines

## Branch Naming Convention

Branches must follow this naming pattern:
`{type}/{jira-task-if-available}_{description}`

Where:

- `type` is one of: `feat`, `fix`, `chore`, `refactor`, `test`
- `jira-task-if-available` is the JIRA task ID (if applicable)
- `description` is a brief description of the work

Examples:

- `feat/PROJ-123_add-login-validation`
- `fix/PROJ-456_resolve-timeout-issue`
- `chore/update-dependencies`
- `refactor/PROJ-789_restructure-utils`
- `test/PROJ-101_add-integration-tests`

## Git Operations

When performing git operations, prioritize the Git MCP server over CLI commands wherever possible.

The Git MCP provides better integration and should be used for:

- Status checks
- Adding files
- Committing changes
- Branch operations (create AND checkout)
- Viewing diffs and logs
- Other standard git operations

Only fall back to CLI git commands when the MCP doesn't support the required functionality.

### Branch Management

When starting work on a new task:

1. **Create the branch** following the naming convention above
2. **Immediately check out the branch** to ensure all work is done on the correct branch
3. Never leave the branch in a created-but-not-checked-out state

Use `git_create_branch` to create and `git_checkout` to switch to the branch, or use the appropriate MCP commands that handle both operations.

## Interactive Commands

Never use commands that require interactive terminal sessions. This includes:

- Commands that prompt for user input
- Interactive editors (vim, nano, etc.)
- Commands with interactive menus or wizards
- Any command that waits for user interaction

Always use non-interactive alternatives or provide all required parameters upfront.

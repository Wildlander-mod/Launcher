# Git MCP Guidelines

## Git Operations

When performing git operations, **always use the Git MCP server** instead of CLI commands.

The Git MCP provides better integration and should be used for all git operations including:

- Status checks (`git_status`)
- Adding files (`git_add`)
- Committing changes (`git_commit`)
- Branch operations (`git_create_branch`, `git_checkout`)
- Viewing diffs (`git_diff`, `git_diff_staged`, `git_diff_unstaged`)
- Viewing logs (`git_log`)
- Showing commits (`git_show`)
- Resetting staged changes (`git_reset`)
- Repository initialization (`git_init`)

## Retry Strategy

If a Git MCP operation fails:

1. **First attempt**: Try the operation with the Git MCP tool
2. **On error**: Enable verbose debugging to understand the failure
3. **Second attempt**: Retry with different parameters or approach based on error details
4. **Third attempt**: Try an alternative Git MCP tool if one exists for the operation
5. **Last resort**: Only after multiple Git MCP attempts fail, fall back to bash commands

Always exhaust Git MCP options before using bash.

### Available Git MCP Tools

- `git_status` - Show working tree status
- `git_add` - Add files to staging area
- `git_commit` - Record changes to repository
- `git_create_branch` - Create new branch
- `git_checkout` - Switch branches
- `git_diff` - Show differences between branches/commits
- `git_diff_staged` - Show staged changes
- `git_diff_unstaged` - Show unstaged changes
- `git_log` - Show commit logs
- `git_show` - Show commit contents
- `git_reset` - Unstage all staged changes
- `git_init` - Initialize new repository

### Best Practices

1. **Always use Git MCP tools** instead of `executeBash` with git commands
2. **Never fall back to CLI** - all standard git operations are supported
3. Follow branch naming conventions as specified in environment.md
4. Create and immediately checkout new branches

### Examples

```typescript
// ✅ Good: Use Git MCP
git_status({ repo_path: "/path/to/repo" })
git_add({ repo_path: "/path/to/repo", files: ["file.ts"] })
git_commit({ repo_path: "/path/to/repo", message: "feat: add feature" })

// ❌ Bad: Use bash
executeBash({ command: "git status", cwd: "/path/to/repo" })
executeBash({ command: "git add file.ts", cwd: "/path/to/repo" })
executeBash({ command: "git commit -m 'feat: add feature'", cwd: "/path/to/repo" })
```

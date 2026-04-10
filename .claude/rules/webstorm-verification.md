# WebStorm MCP Verification Guidelines

## Code Change Verification

After every code change, use WebStorm's MCP server to verify the changes are correct.

### When to Use WebStorm MCP

- **REQUIRED: After any code implementation** - Always verify code correctness
- After refactoring existing code
- When fixing bugs or issues
- Before committing changes

### Verification Process

1. Make code changes
2. Use WebStorm MCP tools to verify:
   - Code compiles without errors
   - No new warnings introduced
   - Code follows project standards
3. Fix any issues identified
4. Proceed with testing (Wallaby for tests, as per wallaby.md)

### Integration with Other Tools

- **WebStorm MCP**: Code correctness and compilation verification
- **Wallaby MCP**: Test execution and coverage verification (see wallaby.md)
- Both tools should be used together for comprehensive verification

### Restrictions

- **Do NOT use `mcp__jetbrains__execute_terminal_command`** — use the Bash tool directly instead for running terminal commands

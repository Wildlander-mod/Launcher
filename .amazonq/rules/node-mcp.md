# Node MCP Guidelines

## npm Script Execution

When executing npm scripts, prioritize the Node MCP server over CLI commands wherever possible.

The Node MCP provides better integration and should be used for:

- Running npm scripts from package.json
- Installing dependencies
- Executing Node.js scripts
- Running tests via npm

### When to Use Node MCP

- **REQUIRED: For all npm script executions** - Use `run-npm-script` instead of `executeBash` with npm commands
- **REQUIRED: For dependency installation** - Use `run-npm-install` instead of `executeBash` with npm install
- For running Node.js files directly - Use `run-node-script`
- For executing JavaScript code - Use `run-node-eval`

### Available Node MCP Tools

- `run-npm-script` - Execute npm scripts from package.json
- `run-npm-install` - Install dependencies
- `run-node-script` - Execute Node.js script files
- `run-node-eval` - Execute JavaScript code directly
- `list-node-versions` - Get available Node.js versions
- `select-node-version` - Select Node.js version to use

### Best Practices

1. **Always use `run-npm-script`** for npm scripts instead of bash commands
2. **Always use `run-npm-install`** for installing dependencies
3. Only fall back to CLI commands when the MCP doesn't support the required functionality
4. Specify the correct `packageDir` parameter (project root directory)

### Examples

```typescript
// ✅ Good: Use Node MCP
run-npm-script({
  packageDir: "/path/to/project",
  scriptName: "test",
  args: ["--coverage"]
})

// ❌ Bad: Use bash
executeBash({
  command: "npm test -- --coverage",
  cwd: "/path/to/project"
})

// ✅ Good: Install dependencies
run-npm-install({
  packageDir: "/path/to/project"
})

// ❌ Bad: Use bash
executeBash({
  command: "npm install",
  cwd: "/path/to/project"
})
```

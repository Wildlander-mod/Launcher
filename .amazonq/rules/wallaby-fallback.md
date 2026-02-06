# Wallaby Fallback Guidelines

## Handling Empty Wallaby MCP Responses

When Wallaby MCP tools return no data or empty results, use JetBrains MCP to start the appropriate Wallaby run configuration.

### Fallback Process

1. Call Wallaby MCP tool (e.g., `wallaby_failingTests`, `wallaby_allTests`)
2. If response is empty or contains no data:
   - Use `get_run_configurations` to find available Wallaby configurations
   - Start the appropriate configuration:
     - `execute_run_configuration` with `"Wallaby Renderer"` for renderer tests
     - `execute_run_configuration` with `"Wallaby Main"` for main process tests
3. Wait for Wallaby to initialize
4. Retry the original Wallaby MCP tool call

### Example Workflow

```typescript
// 1. Try Wallaby MCP
const failingTests = wallaby_failingTests();

// 2. If empty, start Wallaby via JetBrains MCP
if (!failingTests || failingTests.length === 0) {
  execute_run_configuration({ configurationName: "Wallaby Renderer" });
  // or
  execute_run_configuration({ configurationName: "Wallaby Main" });
  
  // 3. Retry after initialization
  const retryTests = wallaby_failingTests();
}
```

### Configuration Selection

- **Renderer tests**: Use `"Wallaby Renderer"` configuration
- **Main process tests**: Use `"Wallaby Main"` configuration
- **Unknown context**: Check both or ask user for clarification

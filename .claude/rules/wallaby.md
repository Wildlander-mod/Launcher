# Wallaby Test Verification Guidelines

## Test Verification with Wallaby MCP

When working with tests, use the Wallaby MCP server to verify test execution and coverage.

### Scope

**Wallaby only tracks unit tests** (renderer and main process). It does **not** track e2e tests (`src/__tests__/e2e/`). After changing e2e tests, run them directly via `npm run test:e2e` or by targeting specific files with the Playwright CLI.

### When to Use Wallaby

- **REQUIRED: After any implementation changes** - Always check for failing tests using `wallaby_failingTests`
- After writing or modifying tests
- When debugging failing tests
- When verifying test coverage
- When analyzing runtime behavior during tests

### Available Wallaby Tools

- `wallaby_failingTests` - Get all failing tests in the project
- `wallaby_allTests` - Get all tests in the project
- `wallaby_failingTestsForFile` - Get failing tests for a specific file
- `wallaby_allTestsForFile` - Get all tests for a specific file
- `wallaby_runtimeValues` - Get runtime values at specific code locations
- `wallaby_coveredLinesForFile` - Get code coverage for a file

### Best Practices

1. **MANDATORY: Always run `wallaby_failingTests` after implementation changes** to ensure no tests were broken
2. **Verify test execution** after writing new tests using `wallaby_allTestsForFile`
3. **Check for failures** using `wallaby_failingTests` or `wallaby_failingTestsForFile`
4. **Analyze coverage** using `wallaby_coveredLinesForFile` to ensure adequate test coverage
5. **Debug runtime issues** using `wallaby_runtimeValues` when tests behave unexpectedly

### Example Workflow

1. Make implementation changes
2. **Run `wallaby_failingTests` to validate no tests were broken**
3. If tests fail, use Wallaby to analyze and fix the failure
4. Write or modify tests as needed
5. Use Wallaby to verify tests pass
6. Check coverage to ensure adequate testing

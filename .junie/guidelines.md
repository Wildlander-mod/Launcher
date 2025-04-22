Follow all generic and project specific instructions in this document.

# Generic Instructions

## Code Quality Practices

- Always prioritize clean, readable, and maintainable code when working with Junie AI
- Prefer `const` over `let` where possible to ensure immutability
- Always declare variables at the lowest scope possible to prevent polluting the outer scope
- Only suggest upgrading libraries when absolutely necessary for functionality
- Avoid unnecessary comments that just repeat what the code already clearly expresses

## TypeScript Practices

- Adhere to TypeScript strict settings as configured in the project
- Avoid using `any` type to maintain type safety and code quality

## Code Generation Instructions

- Remove any output or script files used solely by Junie, including those from previous steps
- When iterating on changes, ensure old unused implementations are properly removed
- When renaming files, always remove the old unused versions to maintain a clean codebase and prevent confusion or
  potential bugs from having multiple versions of the same functionality
- After each code generation, run appropriate tests to validate your changes (see Validation Workflow below)
- After each code generation, validate your code with the appropriate linting tools
- Avoid inserting code between a comment and the method or section it is referencing

## Testing Instructions

- Focus on clear, concise tests that verify functionality rather than implementation details
- Design each test to be specific with a single, focused assertion when possible
- Always use descriptive test names that clearly communicate the test's purpose
- Avoid testing implementation details that may change frequently and lead to brittle tests
- When writing tests, consider edge cases, boundary conditions, and error scenarios
- Always run all tests before submitting code changes to ensure no regressions
- Ensure that tests always focus on the behaviour of the code being tested
- Do not use divs when adding test IDs, use span or other inline elements that do not impact styling instead
- Do not add comments that simply restate what the test assertion already clearly shows

## Validation Workflow Instructions

- First attempt to run tests natively in the IDE before using command line test commands
- After generating code with Junie, always validate your changes by running appropriate tests.
- First, limit your tests to the specific area of code you modified. If only one e2e tests file has been changed, only
  run the tests for that file.
- After validating the specific tests, run all tests to ensure overall functionality unless the change was to a single
  test file and nothing else.
- When tests fail:
    - Analyze failure messages carefully to identify root causes
    - Make targeted modifications to address specific issues
    - Re-run failing tests to verify your fixes
    - Once fixed, run all tests to ensure complete validation
    - Repeat the test-fix-validate cycle until all tests pass successfully
    - Ensure that coverage thresholds defined in the test output are always met before finalizing changes.

# Project-Specific Instructions

## Test Environment Instructions

- The project uses both e2e tests and unit tests.
- For detailed debugging with e2e tests, use: `DEBUG=true npm run test:e2e`
- Test coverage information from e2e and unit tests helps identify untested code paths
- When expected code paths aren't covered, add specific tests to improve coverage

## Project Commands

- Lint - `npm run lint`
- Fix lint issues - `npm run lint:fix`
- All tests (unit and e2e) - `npm run test`
- Unit tests - `npm run test:unit`
- E2E tests - `npm run test:e2e`

## E2E Testing Instructions

- Tests are implemented with Playwright.
- Always use data-testids and `window.getByTestId` when selecting elements
- Exception: When testing user actions like clicking text, you may use that text explicitly
- If a needed data-testid doesn't exist, add it to the relevant file
- If a test times out trying to load http://localhost:8080/#/auto-update it means that the page has reloaded too quick
  before it loaded the application.
- E2e tests are considered a failure if it says "x failed" even if it says "x passed" at the end.
- When analyzing test results, scan the ENTIRE output for failure indicators, not just the final summary
- ANY occurrence of "x failed" or "Error:" in the output indicates test failures that must be addressed
- Test timeouts (e.g., "Timed out 5000ms waiting for...") are considered failures
- Never report tests as passing if there are ANY failure messages in the output
- When tests fail, always include the specific error messages and stack traces in your analysis
- The presence of both "x failed" and "y passed" in the output means the tests have failed

## Project Concepts

The main and renderer process communicate via the ipc handler. All events are defined in .events files.
If a renderer method calls the service with an event name, that name can be used to find the associated controller in
the main process.
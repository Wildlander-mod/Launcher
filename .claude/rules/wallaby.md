# Wallaby Guidelines

## Scope

**Wallaby only tracks unit tests** (renderer and main process). It does **not** track e2e tests (`src/__tests__/e2e/`). After changing e2e tests, run them directly via `npm run test:e2e` or the Playwright CLI.

## Usage

- **MANDATORY: Run `wallaby_failingTests` after every implementation change** to catch regressions
- Use `wallaby_allTestsForFile` to verify new tests are picked up
- Use `wallaby_coveredLinesForFile` to check coverage
- Use `wallaby_runtimeValues` to debug unexpected test behaviour

## If Wallaby Returns Empty Results

Start the appropriate run configuration via JetBrains MCP, then retry:

- Renderer tests → `execute_run_configuration` with `"Wallaby Renderer"`
- Main process tests → `execute_run_configuration` with `"Wallaby Main"`
- Unknown context → start both or ask for clarification

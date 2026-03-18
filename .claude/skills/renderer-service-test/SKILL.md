---
name: renderer-service-test
description: Write renderer unit tests for services in the renderer process. Use when writing or updating tests for renderer services in this project. Trigger whenever the user asks to test a renderer service, add service tests, or continue service testing.
---

## Workflow

### Step 0: Determine the target service

If no service was specified by the user, read `.claude/plans/renderer-services-testing.plan.md` and pick the next unchecked service (the first item without `[x]`). Inform the user which service was selected before proceeding.

### Step 1: Check for an existing plan

Check whether a plan already exists for the service under test in `.claude/plans/`. Plans follow the naming convention `[service-name-kebab-case].plan.md`.

### Step 2: If no plan exists — gather context first

If no plan exists, **do not create the plan or write any tests yet**. First read the service source file to understand its structure. Then ask the user any questions needed before writing a thorough plan — focus on intent, edge cases, and constraints not visible in the code.

Wait for the user's answers before proceeding.

### Step 3: Create the plan

Create a plan at `.claude/plans/[service-name-kebab-case].plan.md` following the plan template at `.claude/templates/plan.template.md`.

The plan must include:
- **Overview**: What is being tested and why
- **Current State Analysis**: Service structure, external dependencies, public API, error paths
- **Implementation Plan**: Phased breakdown of test groups (e.g. happy path, error cases, edge cases)
- **Key Principles**: Testing standards specific to this service
- **Success Criteria**: What passing tests must cover

**STOP after creating the plan and wait for explicit approval before writing any tests.**

### Step 4: Implement tests (after plan approval)

Once the plan is approved, write the tests following the plan and the guidelines below.

---

## Core Principles

Test behaviour at the boundary — what goes in and what comes out — never internal implementation details.

1. **Test the public API**: Call the service's public methods and assert on return values, thrown errors, and side effects.
2. **Mock at the boundary**: Replace external dependencies (browser APIs, IPC, `fetch`) with fakes — never let tests reach real network or storage.
3. **Avoid implementation testing**: Never spy on private methods, assert on internal state, or test that a specific internal function was called.

## What to Test

✅ Return values for different inputs, thrown errors and rejections, calls made to external dependencies (IPC channels, `localStorage` keys, `fetch` URLs), conditional logic branches, edge cases (empty input, null, expired cache, etc.)

❌ Private/internal method calls, the shape of internal data structures, framework internals, trivial getters with no logic.

## Setup Pattern

```typescript
describe("MyService", () => {
  let service: MyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MyService();
  });
});
```

## Mocking Patterns

**`window.ipcRenderer`** — mock before instantiation:

```typescript
const mockInvoke = jest.fn();
const mockOn = jest.fn();

Object.defineProperty(window, "ipcRenderer", {
  value: { invoke: mockInvoke, on: mockOn },
  writable: true,
});
```

**`window.localStorage`** — use `jest.spyOn`:

```typescript
jest.spyOn(window.localStorage, "getItem").mockReturnValue(null);
jest.spyOn(window.localStorage, "setItem");
```

**`fetch`** — replace globally:

```typescript
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({ data: [] }),
  ok: true,
});
```

**Modules** — use `jest.mock()` at the top of the file:

```typescript
jest.mock("electron-log/renderer", () => ({
  debug: jest.fn(),
  error: jest.fn(),
}));
```

## Additional Standards

- One assertion per test
- Descriptive test names (`should X when Y`)
- Always `jest.clearAllMocks()` in `beforeEach`
- Use `await` and `flushPromises` where async behaviour is involved

## Verification

After writing tests, use Wallaby MCP (`wallaby_failingTests`, `wallaby_allTestsForFile`) to verify they pass. If Wallaby returns empty results, start the `"Wallaby Renderer"` run configuration via JetBrains MCP first.

## Commit

Once all tests pass, move the service-specific plan to `.claude/plans/completed/` before committing.

Then commit the changes. The commit must include:
- The new test file
- The overall testing plan at `.claude/plans/renderer-services-testing.plan.md` (with the service's checklist item now checked off)

Do **not** include the service-specific plan file in the commit.

Use a commit message in the format:
```
test(renderer-unit): add unit tests for [ServiceName] service
```

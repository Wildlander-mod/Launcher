---
name: renderer-test
description: Write renderer unit tests for Vue components. Use when writing or updating tests for renderer components in this project.
---

## Workflow

### Step 0: Determine the target component

If no component was specified by the user, read `.claude/plans/renderer-components-testing.plan.md` and pick the next unchecked component from the checklist (i.e. the first item without `[x]`). Inform the user which component was selected before proceeding.

### Step 1: Check for an existing plan

Before doing anything else, check whether a plan already exists for the component under test in `.claude/plans/`. Plans follow the naming convention `[component-name-kebab-case].plan.md`.

### Step 2: If no plan exists — gather context first

If no plan exists, **do not create the plan or write any tests yet**. First read the component source file to understand its structure. Then ask the user any questions needed to fill gaps in your understanding before writing a thorough plan. Only ask questions where the component itself doesn't make the answer clear — focus on intent, priorities, and constraints the user may have in mind that aren't visible in the code.

Wait for the user's answers before proceeding.

### Step 3: Create the plan

Using the answers from the qualifying questions and your analysis of the component, create a plan at `.claude/plans/[component-name].plan.md` following the plan template at `.claude/templates/plan.template.md`.

The plan must include:
- **Overview**: What is being tested and why
- **Current State Analysis**: Component structure, dynamic behaviours, IPC calls, events, props, child components
- **Implementation Plan**: Phased breakdown of test groups (e.g. rendering, interactions, lifecycle, modals)
- **Key Principles**: Testing standards specific to this component
- **Success Criteria**: What passing tests must cover

**STOP after creating the plan and wait for explicit approval before writing any tests.**

### Step 4: Implement tests (after plan approval)

Once the plan is approved, write the tests following the plan and the guidelines below.

---

Write renderer unit tests following these guidelines:

## Core Principles

Test from a user's perspective — interactions and observable results only, never implementation details.

1. **Test user interactions**: Simulate actual user actions with `trigger('click')`, `setValue()`, etc.
2. **Test observable results**: Verify rendered content, CSS classes, visibility, emitted events.
3. **Avoid implementation testing**: Never test internal methods, computed properties in isolation, or private state.

## What to Test

✅ User interactions (clicks, typing, hovering), dynamic rendered output, emitted events, prop-driven visual changes, conditional rendering, loading states, error states.

❌ Internal methods, computed property logic in isolation, private state, framework internals, static CSS classes, simple slot pass-through, TypeScript type enforcement.

### When NOT to Write Tests
- Component has no dynamic behavior (all static rendering)
- Slots have no custom logic
- No conditional rendering, user interactions, or events

## Setup Pattern

Always use `beforeEach` when mounting config is shared across tests:

```typescript
describe("MyComponent", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(MyComponent, {
      shallow: true,
      props: { /* common props */ },
      global: {
        stubs: { /* common stubs */ },
        renderStubDefaultSlot: true,
      },
    });
  });
});
```

## Selectors

Use `byTestId()` and abstract selectors to a `const selectors` object:

```typescript
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

const selectors = {
  button: byTestId("submit-button"),
  input: byTestId("email-input"),
};

// Good
await wrapper.find(selectors.button).trigger('click');

// Bad — never use raw data-testid strings or call methods directly
await wrapper.find('[data-testid="button"]').trigger('click');
wrapper.vm.handleClick();
```

## Mocking

**Components**: Use `global.stubs`, not `jest.mock()`:

```typescript
const MockPopper = {
  name: "Popper",
  template: "<div><slot name='content' /><slot /></div>",
};

mount(MyComponent, {
  shallow: true,
  global: { stubs: { Popper: MockPopper }, renderStubDefaultSlot: true },
});
```

**Directives**: Capture the handler via `global.directives` for explicit invocation:

```typescript
let clickAwayHandler: (() => void) | undefined;

mount(MyComponent, {
  shallow: true,
  global: {
    directives: {
      "click-away": {
        mounted(_el: HTMLElement, binding: { value: () => void }) {
          clickAwayHandler = binding.value;
        },
      },
    },
  },
});

// In test
clickAwayHandler?.();
```

## Additional Standards

- Always `shallow: true`
- Always `renderStubDefaultSlot: true` in global config
- One assertion per test
- Descriptive test names (`should X when Y`)
- Use `await wrapper.vm.$nextTick()` when needed for reactivity

## Verification

After writing tests, use Wallaby MCP (`wallaby_failingTests`, `wallaby_allTestsForFile`) to verify they pass. If Wallaby returns empty results, start the `"Wallaby Renderer"` run configuration via JetBrains MCP first.

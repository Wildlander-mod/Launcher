# Renderer Unit Testing Guidelines

## User Behavior-Driven Testing

Renderer unit tests should prioritize testing from a user's perspective, focusing on interactions and observable results rather than implementation details.

## Core Principles

### 1. Test User Interactions
- Simulate actual user actions (clicks, typing, hovering, etc.)
- Use event triggering methods like `trigger('click')`, `setValue()`, etc.
- Test the component as a user would interact with it

### 2. Test Observable Results
- Verify what the user sees (rendered content, CSS classes, visibility)
- Check state changes that affect the UI
- Validate emitted events that trigger parent component behavior

### 3. Avoid Implementation Testing
- Don't test internal methods directly
- Don't test computed properties in isolation
- Don't test component internals that users can't observe

## Testing Patterns

### Good: User Behavior Testing
```typescript
it('should disable button when clicked while loading', async () => {
  const wrapper = mount(MyButton, { shallow: true });
  
  await wrapper.trigger('click');
  
  expect(wrapper.classes()).toContain('is-disabled');
});
```

### Bad: Implementation Testing
```typescript
it('should set isLoading to true', () => {
  const wrapper = mount(MyButton, { shallow: true });
  
  wrapper.vm.handleClick(); // Don't call methods directly
  
  expect(wrapper.vm.isLoading).toBe(true); // Don't test internal state
});
```

## Interaction Testing Examples

### Click Events
```typescript
it('should emit submit event when button is clicked', async () => {
  const wrapper = mount(MyForm, { shallow: true });
  
  await wrapper.find('[data-testid="submit-btn"]').trigger('click');
  
  expect(wrapper.emitted('submit')).toBeTruthy();
});
```

### Input Changes
```typescript
it('should display error message when invalid email is entered', async () => {
  const wrapper = mount(EmailInput, { shallow: true });
  
  await wrapper.find('input').setValue('invalid-email');
  await wrapper.find('input').trigger('blur');
  
  expect(wrapper.find('.error-message').text()).toBe('Invalid email');
});
```

### Hover States
```typescript
it('should show tooltip when hovering over icon', async () => {
  const wrapper = mount(IconWithTooltip, { shallow: true });
  
  await wrapper.find('.icon').trigger('mouseenter');
  
  expect(wrapper.find('.tooltip').isVisible()).toBe(true);
});
```

## What to Test

### ✅ Do Test
- User interactions (clicks, typing, hovering)
- Dynamic rendered output (text, HTML structure, CSS classes that change based on props/state)
- Emitted events
- Prop-driven visual changes
- Conditional rendering based on user actions or props
- Form validation feedback
- Loading states
- Error states

### ❌ Don't Test
- Internal method implementations
- Computed property logic in isolation
- Private component state
- Implementation details that don't affect the UI
- Framework internals (Vue's reactivity, etc.)
- Static CSS classes that never change
- Simple slot rendering without custom logic
- Component structure without dynamic behavior
- TypeScript type enforcement (handled at compile time)

## Component Testing Strategy

1. **Identify dynamic behavior**: What changes based on props, state, or user interaction?
2. **Identify user interactions**: What can users do with this component?
3. **Define expected results**: What should users see/experience?
4. **Write tests**: Simulate interactions and verify results
5. **Validate edge cases**: Test error states, disabled states, etc.

### When NOT to Write Tests
- Component has no dynamic behavior (all static rendering)
- Slots have no custom logic (simple pass-through)
- No conditional rendering or computed values
- No user interactions or events
- Static components that always render the same child components without conditions

## Integration with Existing Standards

These guidelines complement the existing testing standards in `memory-bank/guidelines.md`:
- Continue using shallow mounting by default
- Maintain single assertion per test
- Use descriptive test names
- Follow the established test structure

## Best Practices

### Shallow Mounting Configuration
- Always use `shallow: true` by default
- Enable `renderStubDefaultSlot: true` in global config to render default slot content
- This allows testing component behavior without rendering child components

### Component Mocking
- Mock external components using `stubs` in mount options, not `jest.mock()`
- Define mock components as simple objects with template strings
- Pass stubs via `global.stubs` in mount configuration

```typescript
// Good: Mock as stub
const MockPopper = {
  name: "Popper",
  template: "<div><slot name='content' /><slot /></div>",
};

const wrapper = mount(MyComponent, {
  shallow: true,
  global: {
    stubs: {
      Popper: MockPopper,
    },
    renderStubDefaultSlot: true,
  },
});

// Bad: Using jest.mock()
jest.mock("vue3-popper", () => ({
  default: { /* ... */ },
}));
```

### Directive Mocking
- Mock custom directives via `global.directives` in mount options
- Keep directive mocks as simple as possible - capture the handler for explicit invocation
- Use proper TypeScript types for directive parameters

```typescript
let clickAwayHandler: (() => void) | undefined;

const wrapper = mount(MyComponent, {
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

// Later in test
clickAwayHandler?.(); // Explicitly trigger the directive behavior
```

### Test Organization
- Use `beforeEach` to set up common mounting configuration when duplicated across tests
- Declare wrapper variable at describe block level for shared access
- Keep test-specific setup in individual test cases

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

  it("should do something", async () => {
    // Test implementation
  });
});
```

### Simulating User Actions
- Always trigger events on elements, never call component methods directly
- For directive behavior (like click-away), capture and explicitly invoke the handler
- Wait for Vue's reactivity with `await wrapper.vm.$nextTick()` when needed
- Use `byTestId()` utility function for selecting elements by data-testid
- Abstract selectors to a const object for reusability

```typescript
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

// Selectors
const selectors = {
  button: byTestId("submit-button"),
  input: byTestId("email-input"),
  error: byTestId("error-message"),
};

// Good: Use abstracted selectors
await wrapper.find(selectors.button).trigger('click');
const element = wrapper.find(selectors.input);

// Good: Explicitly invoke directive handlers
clickAwayHandler?.();

// Bad: Manual selector strings
await wrapper.find('[data-testid="button"]').trigger('click'); // Don't do this

// Bad: Call methods directly
wrapper.vm.handleClick(); // Don't do this
```
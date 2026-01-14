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

## Integration with Existing Standards

These guidelines complement the existing testing standards in `memory-bank/guidelines.md`:
- Continue using shallow mounting by default
- Maintain single assertion per test
- Use descriptive test names
- Follow the established test structure

# BaseInput.vue Component Test Plan

## Overview

This plan outlines comprehensive test coverage for the BaseInput.vue component, a reusable input component that wraps a text input with a label. The component uses Vue class-based syntax with decorators and emits input and click events.

## Current State Analysis

### Component Structure
- **Template**: Contains a div wrapper with BaseLabel and input elements
- **Props**: 4 props (label, readonly, centered, value)
- **Events**: 2 emitted events (input, click)
- **Dependencies**: BaseLabel component
- **Styling**: Scoped SCSS with design system variables

### Component Interface
```typescript
Props:
- label: string (required) - Text for the label
- readonly: boolean (default: false) - Makes input readonly
- centered: boolean (default: false) - Centers the label
- value: string - Input value

Events:
- input: Emitted on input change, returns HTMLInputElement
- click: Emitted on input click, returns HTMLInputElement
```

### Current Testing Gap
No existing tests found for BaseInput.vue component. Full test coverage needed.

## Test Strategy

### Testing Framework
- **Jest** for renderer process component testing
- **@vue/test-utils** for Vue component mounting and interaction
- **Shallow mounting** by default as per guidelines

### Test Organization
- Group tests by functionality (props, events, rendering)
- Single assertion per test where possible
- Descriptive test names following "should [expected behavior]" pattern

## Test Cases

### 1. User Interaction Testing

#### 1.1 Typing in Input
- **Test**: Should emit input event when user types
- **User Action**: Type text into input field
- **Observable Result**: 'input' event emitted with HTMLInputElement
- **Method**: Trigger input event, verify emission and payload

#### 1.2 Clicking Input
- **Test**: Should emit click event when user clicks input
- **User Action**: Click on input field
- **Observable Result**: 'click' event emitted with HTMLInputElement
- **Method**: Trigger click event, verify emission and payload

### 2. Prop-Driven Visual Changes

#### 2.1 Label Display
- **Test**: Should display label text
- **Observable Result**: Label text appears above input
- **Method**: Mount with label prop, verify BaseLabel receives label text

#### 2.2 Label Centering
- **Test**: Should center label when centered prop is true
- **Observable Result**: Label appears centered
- **Method**: Mount with centered=true, verify BaseLabel receives centered prop

- **Test**: Should not center label by default
- **Observable Result**: Label appears left-aligned (default)
- **Method**: Mount without centered prop, verify BaseLabel receives centered=false

#### 2.3 Value Display
- **Test**: Should display value in input field
- **Observable Result**: Input shows provided value
- **Method**: Mount with value prop, verify input element has correct value

- **Test**: Should update displayed value when value prop changes
- **Observable Result**: Input shows new value
- **Method**: Change value prop, verify input element updates

#### 2.4 Readonly State
- **Test**: Should make input readonly when readonly prop is true
- **Observable Result**: Input has readonly attribute, user cannot edit
- **Method**: Mount with readonly=true, verify input has readonly attribute

- **Test**: Should allow editing by default
- **Observable Result**: Input is editable
- **Method**: Mount without readonly prop, verify input does not have readonly attribute

### 3. Edge Cases (Observable Results)

#### 3.1 Empty and Missing Values
- **Test**: Should handle empty label string
- **Observable Result**: Component renders with empty label
- **Method**: Mount with label="", verify rendering

- **Test**: Should handle undefined value
- **Observable Result**: Input renders empty
- **Method**: Mount without value prop, verify input renders

#### 3.2 Long Content
- **Test**: Should handle very long label text
- **Observable Result**: Long label displays without breaking layout
- **Method**: Mount with long label string, verify rendering

- **Test**: Should handle very long value
- **Observable Result**: Long value displays in input
- **Method**: Mount with long value string, verify input value

#### 3.3 Special Characters
- **Test**: Should display special characters in value
- **Observable Result**: Special characters appear correctly in input
- **Method**: Mount with value containing special chars, verify display

## Test Implementation Structure

### Test File Organization
```
src/__tests__/unit/renderer/components/BaseInput.test.ts
```

### Test Groups
1. **User Interaction Tests** - Typing and clicking behaviors
2. **Prop-Driven Visual Tests** - How props affect what users see
3. **Edge Cases** - Unusual inputs and boundary conditions

### User Behavior-Driven Approach
- Focus on user actions (typing, clicking)
- Test observable results (displayed text, readonly state, emitted events)
- Avoid testing internal implementation
- Don't test BaseLabel internals (it's mocked)

### What NOT to Test
- ❌ Internal component state
- ❌ Prop validation (TypeScript handles this)
- ❌ Vue's reactivity system
- ❌ BaseLabel component internals (test BaseLabel separately)
- ❌ Static CSS classes that never change
- ❌ Component structure without dynamic behavior

### Mock Strategy
- **BaseLabel**: Mock child component using shallow mounting
- **Events**: Use Jest to verify event emission
- **Focus**: Test BaseInput behavior, not BaseLabel behavior

### Event Testing Pattern
```typescript
// Test user interaction and observable result
await wrapper.find('input').trigger('input');
expect(wrapper.emitted('input')).toBeTruthy();
expect(wrapper.emitted('input')[0][0]).toBeInstanceOf(HTMLInputElement);
```

### Prop Testing Pattern
```typescript
// Test observable result of prop
const wrapper = mount(BaseInput, {
  props: { label: 'Test', readonly: true },
  shallow: true
});
expect(wrapper.find('input').attributes('readonly')).toBeDefined();
```

## Success Criteria

### Coverage Requirements
- **100% coverage of dynamic behavior** - All user interactions and prop-driven changes
- **All observable results tested** - What users see and experience
- **Edge cases covered** - Unusual inputs that affect rendering
- **Event emission verified** - All user-triggered events

### Quality Standards
- Tests focus on user behavior, not implementation
- Single assertion per test where possible
- Descriptive test names explaining user action and expected result
- No testing of internal state or methods
- No testing of mocked child components

### Validation Checklist
- [ ] All user interactions tested (typing, clicking)
- [ ] All prop-driven visual changes tested
- [ ] All emitted events verified with correct payloads
- [ ] Edge cases handled gracefully
- [ ] Tests pass consistently
- [ ] No implementation details tested

## Implementation Notes

### User Behavior-Driven Testing Patterns
- Use `mount(BaseInput, { shallow: true })` for isolation
- Trigger user actions: `wrapper.find('input').trigger('input')`
- Verify observable results: check rendered attributes, CSS classes, emitted events
- Don't call internal methods or check internal state

### What to Focus On
- ✅ User interactions (typing, clicking)
- ✅ Observable results (displayed text, readonly state)
- ✅ Emitted events with correct payloads
- ✅ Prop-driven visual changes

### What to Avoid
- ❌ Testing BaseLabel internals (it's mocked)
- ❌ Testing internal component state
- ❌ Testing Vue's reactivity
- ❌ Testing prop validation (TypeScript's job)

## Dependencies

### Required Packages
- `@vue/test-utils` - Vue component testing utilities
- `jest` - Test framework
- `@types/jest` - TypeScript definitions

### Component Dependencies
- `BaseLabel.vue` - Child component (will be mocked)
- Vue class component decorators
- SCSS styling (not directly tested)

## Timeline Estimate

### Implementation Phases
1. **Setup and Basic Tests** - 2 hours
2. **Props and Events Testing** - 3 hours  
3. **Edge Cases and Integration** - 2 hours
4. **Accessibility and Validation** - 1 hour
5. **Review and Refinement** - 1 hour

**Total Estimated Time**: 9 hours

## Risk Assessment

### Low Risk
- Component is relatively simple with clear interface
- Well-defined props and events
- Existing testing infrastructure in place

### Medium Risk
- Event payload testing requires careful HTMLInputElement verification
- BaseLabel integration testing needs proper mocking strategy

### Mitigation Strategies
- Start with basic rendering tests to establish foundation
- Use comprehensive mocking for BaseLabel component
- Implement event testing incrementally with payload validation
- Add extensive edge case coverage for robustness
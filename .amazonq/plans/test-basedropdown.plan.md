# BaseDropdown.vue Component Test Plan

## Overview

This plan outlines comprehensive test coverage for the BaseDropdown.vue component, a reusable dropdown/select component built with Vue 3 class-based syntax and vue3-popper integration.

**Status**: Phase 1.2 Complete

## Current State Analysis

### Component Structure
- **Framework**: Vue 3 with class-based component syntax
- **Dependencies**: vue3-popper, vue3-click-away
- **Props**: 6 props with various types and defaults
- **Events**: 1 custom event (`selected`)
- **Slots**: 1 default slot for tooltip content
- **State**: 2 reactive properties (`isOpen`, `loading`)
- **Methods**: 2 public methods (`select`, `toggleOpenState`)

### Key Features
- Dropdown with expandable options list
- Tooltip integration via Popper
- Click-away functionality to close dropdown
- Disabled and hidden option support
- Loading state management
- Responsive sizing options
- CSS animations for open/close states

### Test Requirements
Based on development guidelines, tests should:
- Use shallow mounting by default
- Single assertion per test where possible
- Mock child components when necessary
- Use descriptive test names
- Follow Jest testing patterns for renderer components

## Implementation Plan

### Phase 1: User Interaction Testing

#### 1.1 Opening and Closing Dropdown
- [x] **Should open dropdown when clicking the head**
  - Click dropdown head element
  - Verify options container becomes visible
  - Verify CSS classes change to show open state

- [x] **Should close dropdown when clicking the head while open**
  - Open dropdown, then click head again
  - Verify options container becomes hidden
  - Verify CSS classes change to show closed state

- [x] **Should close dropdown when clicking outside**
  - Open dropdown, then click outside the component
  - Verify options container becomes hidden

#### 1.2 Selecting Options
- [x] **Should select option when clicking it**
  - Open dropdown and click an option
  - Verify 'selected' event is emitted with correct option
  - Verify dropdown closes after selection

- [x] **Should not select disabled options**
  - Open dropdown and click a disabled option
  - Verify no 'selected' event is emitted
  - Verify dropdown remains open

- [x] **Should not display hidden options**
  - Render dropdown with hidden options
  - Verify hidden options are not visible in the list

### Phase 2: Prop-Driven Visual Changes

#### 2.1 Current Selection Display
- [ ] **Should display current selection text**
  - Render with currentSelection prop
  - Verify selection text appears in dropdown head

#### 2.2 Size Variations
- [ ] **Should apply small styling when small prop is true**
  - Render with small=true
  - Verify options container has small modifier class

- [ ] **Should apply full width when grow prop is false**
  - Render with grow=false (default)
  - Verify component has fixed width class

- [ ] **Should not apply fixed width when grow prop is true**
  - Render with grow=true
  - Verify component does not have fixed width class

#### 2.3 Options Rendering
- [ ] **Should render all visible options**
  - Render with array of options
  - Verify all non-hidden options appear in list
  - Verify option text displays correctly

- [ ] **Should show disabled styling for disabled options**
  - Render with disabled options
  - Verify disabled options have disabled styling/classes

### Phase 3: Tooltip Behavior

#### 3.1 Tooltip Display
- [ ] **Should show tooltip when showTooltip is true**
  - Render with showTooltip=true
  - Verify tooltip/popper is visible

- [ ] **Should hide tooltip when showTooltip is false**
  - Render with showTooltip=false (default)
  - Verify tooltip/popper is hidden

- [ ] **Should show tooltip on hover when showTooltipOnHover is true**
  - Render with showTooltipOnHover=true
  - Trigger mouseenter on dropdown
  - Verify tooltip becomes visible

### Phase 4: Loading State

#### 4.1 Initial Loading
- [ ] **Should hide options during initial loading**
  - Render component (loading starts as true)
  - Verify options are not visible

- [ ] **Should show options after first open**
  - Open dropdown for first time
  - Verify options become visible
  - Verify loading state ends

### Phase 5: Slot Content

#### 5.1 Tooltip Slot
- [ ] **Should render slot content in tooltip**
  - Render with slot content
  - Verify slot content appears in Popper tooltip area

### Phase 6: Edge Cases (Observable Results)

#### 6.1 Empty States
- [ ] **Should handle empty options array**
  - Render with empty options array
  - Verify component renders without errors
  - Verify no options are displayed

- [ ] **Should handle all options being hidden**
  - Render with all options marked as hidden
  - Verify no options are displayed in list

#### 6.2 Boundary Conditions
- [ ] **Should handle single option**
  - Render with single option
  - Verify option displays and is selectable

- [ ] **Should handle very long option text**
  - Render with option containing very long text
  - Verify text displays without breaking layout

- [ ] **Should handle special characters in option text**
  - Render with special characters in option text
  - Verify text displays correctly

## File Structure (Target)

```
src/__tests__/unit/renderer/components/
└── BaseDropdown.test.ts (new test file)
```

## Key Principles

### User Behavior-Driven Approach
- Focus on user interactions (clicks, hovers)
- Test observable results (visible elements, CSS classes, emitted events)
- Avoid testing internal state or methods directly
- Test what users see and experience

### Test Grouping
- Group by user interaction type (opening/closing, selecting, tooltips)
- Use descriptive describe blocks
- Single assertion per test where possible
- Use beforeEach for common setup

### What NOT to Test
- ❌ Internal state (isOpen, loading) unless it affects UI
- ❌ Internal methods (select, toggleOpenState) - test via user interactions
- ❌ Component implementation details
- ❌ Vue's reactivity system
- ❌ Static CSS classes that never change

### Mock Strategy
- Mock vue3-popper component (external dependency)
- Mock vue3-click-away directive (external dependency)
- Use shallow mounting by default
- Create helper functions for common test scenarios

### Test Data
- Create factory functions for SelectOption objects
- Include edge case test data (empty, disabled, hidden)
- Use consistent test data across related tests

## Success Criteria

### Coverage Requirements
- 100% line coverage for component logic
- All props tested with valid and invalid inputs
- All events tested with proper payloads
- All user interactions tested
- All edge cases covered

### Quality Standards
- All tests pass consistently
- Tests are maintainable and readable
- Tests follow project conventions
- No flaky or intermittent failures
- Performance impact is minimal

### Documentation
- Clear test descriptions
- Commented complex test logic
- Examples of expected behavior
- Edge case documentation

## Implementation Summary

*To be completed after implementation*

## Notes

### Testing Approach
- Use Vue Test Utils for component mounting
- Simulate user interactions (clicks, hovers)
- Verify observable results (rendered content, CSS classes, events)
- Mock external dependencies appropriately
- Focus on what users see and do, not internal implementation

### Common Patterns
- Use factory functions for test data creation
- Create reusable assertion helpers
- Group related tests logically
- Use descriptive test names that explain expected behavior

### Maintenance Considerations
- Tests should be resilient to minor implementation changes
- Focus on public API and user interactions
- Avoid testing internal state unless necessary
- Keep tests simple and focused

### Dependencies

**Testing Libraries:**
- Jest (already configured)
- @vue/test-utils (for component testing)
- Vue 3 test utilities

**Component Dependencies:**
- vue3-popper (needs mocking)
- vue3-click-away (needs mocking)
- Material Icons (for icon rendering)
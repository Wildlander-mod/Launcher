# Renderer Components Testing Requirements

## All renderer components require comprehensive tests

**Note:** Every time a component has a plan to test it, once the testing implementation is completed, this plan should be updated to reflect the completion status.

**Important:** After implementing tests for each component, always run the test suite to verify the tests pass before marking the component as completed.

## Component Testing Checklist

Below is a complete list of all renderer components that require testing:

### Base Components
- [x] AppDropdownFileSelect.vue - completed ✓
- [x] AppModal.vue - completed ✓
- [ ] AppPage.vue
- [ ] AppPageContent.vue
- [ ] BaseButton.vue
- [x] BaseDropdown.vue - completed ✓
- [ ] BaseImage.vue
- [ ] BaseInput.vue
- [ ] BaseLabel.vue
- [ ] BaseLink.vue
- [ ] BaseList.vue

### Feature Components
- [ ] Community.vue
- [ ] ENB.vue
- [ ] GraphicsSelection.vue
- [ ] ImageWithText.vue
- [ ] LauncherVersion.vue
- [ ] MO2RunningModal.vue
- [ ] ModDirectory.vue
- [ ] NavigationItem.vue
- [ ] News.vue
- [ ] Patrons.vue
- [ ] ProfileSelection.vue
- [ ] Resolution.vue

### Layout Components
- [ ] TheHeader.vue
- [ ] TheNavigation.vue
- [ ] TheTitleBar.vue

## Total Components: 26

Each component should have:
- Unit tests covering all functionality
- Tests should focus on having single assertions per test where possible
- Tests should be written in Jest
- Child components should always be mocked using shallow mocking by passing shallow:true to the mount function unless the child component is required to be mocked in a specific way. 
- If a child component is required to be mocked, a comment should be added to the test file explaining why the component is being mocked.
# Renderer Components Testing Requirements

## All renderer components require comprehensive tests

**Note:** Every time a component has a plan to test it, once the testing implementation is completed, this plan should be updated to reflect the completion status.

**Important:** After implementing tests for each component, always run the test suite to verify the tests pass before marking the component as completed.

## Component Testing Checklist

Below is a complete list of all renderer components that require testing:

### Base Components
- [x] AppDropdownFileSelect.vue - completed ✓
- [x] AppModal.vue - completed ✓
- [x] AppPage.vue - completed ✓
- [x] AppPageContent.vue - completed ✓
- [x] BaseButton.vue - completed ✓
- [x] BaseDropdown.vue - completed ✓
- [x] BaseImage.vue - completed ✓
- [x] BaseInput.vue - completed ✓
- [x] BaseLabel.vue - completed ✓
- [x] BaseLink.vue - completed ✓
- [x] BaseList.vue - completed ✓

### Feature Components
- [x] Community.vue - completed ✓
- [x] ENB.vue - completed ✓
- [x] GraphicsSelection.vue - completed ✓
- [x] ImageWithText.vue - completed ✓
- [x] LauncherVersion.vue - completed ✓
- [x] MO2RunningModal.vue - completed ✓
- [x] ModDirectory.vue - completed ✓
- [x] NavigationItem.vue - completed ✓
- [x] News.vue - completed ✓
- [x] Patrons.vue - completed ✓
- [x] ProfileSelection.vue - completed ✓
- [x] Resolution.vue - completed ✓

### Layout Components
- [x] TheHeader.vue - completed ✓
- [x] TheNavigation.vue - completed ✓
- [x] TheTitleBar.vue - completed ✓

### Views
- [x] AutoUpdate.vue - completed ✓
- [x] ViewAdvanced.vue - completed ✓
- [x] ViewCommunity.vue - completed ✓
- [x] ViewHome.vue - completed ✓

NOTE - The navigation is throwing console errors and isn't 100% covered. This should be done next!!!!!!!

## Total Components: 30

Each component should have:
- Unit tests covering all functionality
- Tests should focus on having single assertions per test where possible
- Tests should be written in Jest
- Child components should always be mocked using shallow mocking by passing shallow:true to the mount function unless the child component is required to be mocked in a specific way. 
- If a child component is required to be mocked, a comment should be added to the test file explaining why the component is being mocked.
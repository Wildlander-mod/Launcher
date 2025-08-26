# Renderer Components Testing Requirements

## All renderer components require comprehensive tests

**Note:** Every time a component has a plan to test it, once the testing implementation is completed, this plan should be updated to reflect the completion status.

## Component Testing Checklist

Below is a complete list of all renderer components that require testing:

### Base Components
- [ ] AppDropdownFileSelect.vue
- [ ] AppModal.vue
- [ ] AppPage.vue
- [ ] AppPageContent.vue
- [ ] BaseButton.vue
- [ ] BaseDropdown.vue
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
- Props validation tests
- Event emission tests
- Computed properties tests
- Method tests
- Accessibility tests where applicable
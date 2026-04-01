# Missing E2E Tests Plan

## Overview

This plan tracks the identification and addition of missing e2e tests across the Wildlander Launcher application. A full audit of existing e2e test coverage was conducted against the application's features and user flows. Five areas of missing coverage were identified, ranging from entirely untested features (auto-update) to missing edge cases in otherwise well-tested areas (cancel paths, error handling).

**Status**: Not started

---

## Current State Analysis

The e2e test suite covers the main happy-path flows comprehensively: mod selection, profile/graphics/ENB/resolution changes, game launch, MO2 launch from the Advanced page, news/patrons caching, community/header links, and all three restore operations. The test utilities are mature and well-structured, with dedicated helpers for mocking (`mocks.ts`), state waiting (`app-state.ts`), file assertions (`file-utils.ts`), and page navigation (`navigation.ts`).

The gaps fall into five categories:

1. **Auto-update flow** — `AutoUpdate.vue` is completely untested. It has three distinct UI states driven by IPC events (`UPDATE_AVAILABLE`, `DOWNLOAD_PROGRESS`) and no corresponding test file exists.
2. **Show hidden profiles toggle initial state** — `launcher-actions.e2e.ts` tests `check-prerequisites` toggle for initial state and preference updates (3 tests) but the equivalent tests are missing for the `show-hidden-profiles` toggle on the same Advanced page.
3. **Cancel path for restore dialogs** — All three restore operations (ENB presets, MO2 profiles, graphics presets) only test the confirm path. The cancel path (user dismisses the confirmation) is untested.
4. **MO2 already running when launching the game** — `mo2-launch.e2e.ts` tests MO2 already-running detection for the "Launch MO2" button on the Advanced page. The equivalent scenario for the main game launch button (home page) is untested.
5. **Error handling on Advanced page actions** — All four async actions on the Advanced page (`launchMO2`, `restoreENBPresets`, `restoreProfiles`, `restoreGraphics`) have try/catch blocks that show error dialogs, but no tests exercise these error paths.

---

## Plan

### Phase 1: Auto-update flow tests
- [ ] 1.1 Create `src/__tests__/e2e/auto-update.e2e.ts`
  - [ ] 1.1.1 Test that the auto-update modal shows the "Checking for update..." loading state on open
  - [ ] 1.1.2 Test that the `UPDATE_AVAILABLE` event transitions the modal from loading to the update-available content
  - [ ] 1.1.3 Test that the `DOWNLOAD_PROGRESS` event updates the displayed download percentage

### Phase 2: Show hidden profiles toggle — initial state tests
- [ ] 2.1 Add tests to `src/__tests__/e2e/launcher-actions.e2e.ts`
  - [ ] 2.1.1 Test that `show-hidden-profiles-toggle` has `aria-checked="false"` when preference is not set (default)
  - [ ] 2.1.2 Test that `show-hidden-profiles-toggle` has `aria-checked="true"` when preference is set to `true`
  - [ ] 2.1.3 Test that toggling the switch updates the `SHOW_HIDDEN_PROFILE` user preference

### Phase 3: Cancel path for restore confirmation dialogs
- [ ] 3.1 Add cancel test to `src/__tests__/e2e/shader-options.e2e.ts`
  - [ ] 3.1.1 Test that cancelling the "Restore ENB presets" confirmation does not modify any ENB preset files
- [ ] 3.2 Add cancel test to `src/__tests__/e2e/profile-selection.e2e.ts`
  - [ ] 3.2.1 Test that cancelling the "Restore MO2 profiles" confirmation does not modify any profile files
- [ ] 3.3 Add cancel test to `src/__tests__/e2e/graphics-options.e2e.ts`
  - [ ] 3.3.1 Test that cancelling the "Restore graphics presets" confirmation does not modify any graphics preset files

### Phase 4: MO2 already running when launching the game
- [ ] 4.1 Add tests to `src/__tests__/e2e/launch-game.e2e.ts`
  - [ ] 4.1.1 Test that the MO2-already-running dialog is shown when MO2 is detected as running before game launch
  - [ ] 4.1.2 Test that the game does not launch when the user cancels the MO2-already-running dialog
  - [ ] 4.1.3 Test that MO2 processes are killed and the game launches when the user confirms the kill action

### Phase 5: Error handling on Advanced page actions
- [ ] 5.1 Add error tests to `src/__tests__/e2e/launcher-actions.e2e.ts`
  - [ ] 5.1.1 Test that an error dialog is shown when MO2 fails to launch
- [ ] 5.2 Add error tests to `src/__tests__/e2e/shader-options.e2e.ts`
  - [ ] 5.2.1 Test that an error dialog is shown when restoring ENB presets fails
- [ ] 5.3 Add error tests to `src/__tests__/e2e/profile-selection.e2e.ts`
  - [ ] 5.3.1 Test that an error dialog is shown when restoring MO2 profiles fails
- [ ] 5.4 Add error tests to `src/__tests__/e2e/graphics-options.e2e.ts`
  - [ ] 5.4.1 Test that an error dialog is shown when restoring graphics presets fails

---

## File Structure (Target)

```
src/__tests__/e2e/
├── auto-update.e2e.ts          ← new file
├── launch-game.e2e.ts          ← add Phase 4 tests
├── launcher-actions.e2e.ts     ← add Phase 2 and Phase 5.1 tests
├── shader-options.e2e.ts       ← add Phase 3.1 and Phase 5.2 tests
├── profile-selection.e2e.ts    ← add Phase 3.2 and Phase 5.3 tests
└── graphics-options.e2e.ts     ← add Phase 3.3 and Phase 5.4 tests
```

---

## Key Principles

- Each new test should follow the existing pattern: `beforeEach` sets up via `startTestApp` + `setModpackAndWaitForAppLoaded`, `afterEach` calls `closeTestApp`
- Use existing mock utilities (`mockMessageBox`, `mockErrorDialog`, `replacePsListWithMock`, `replaceChildProcessExecWithMock`) rather than introducing new ones
- Cancel path tests should assert file contents are unchanged, not just that no error was thrown
- Auto-update tests will require new IPC event emission helpers to trigger `UPDATE_AVAILABLE` and `DOWNLOAD_PROGRESS` from within the test

---

## Success Criteria

- All five phases are complete with no failing tests
- No existing tests are broken by additions
- Cancel path tests assert file contents are unchanged after cancelling
- Auto-update tests cover all three modal states
- Error handling tests verify the correct error dialog title and message content

---

## Notes

- The `show-hidden-profiles` toggle tests in Phase 2 closely mirror the existing `check-prerequisites` toggle tests in `launcher-actions.e2e.ts` — use those as a reference
- Phase 4 (MO2 running on game launch) should reference `mo2-launch.e2e.ts` for patterns around `replacePsListWithMock` and `waitForMessageBoxShown`
- Auto-update (Phase 1) will likely need investigation into how to emit IPC events from the Electron main process into the renderer during tests — check `mocks.ts` for existing patterns using `electronApp.evaluate`

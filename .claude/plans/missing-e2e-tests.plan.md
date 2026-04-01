# Missing E2E Tests Plan

## Overview

This plan tracks the identification and addition of missing e2e tests across the Wildlander Launcher application. A full audit of existing e2e test coverage was conducted against the application's features and user flows. Five areas of missing coverage were identified, ranging from entirely untested features (auto-update) to missing edge cases in otherwise well-tested areas (cancel paths, error handling).

**Status**: Phase 1 Complete

---

## Current State Analysis

The e2e test suite covers the main happy-path flows comprehensively: mod selection, profile/graphics/ENB/resolution changes, game launch, MO2 launch from the Advanced page, news/patrons caching, community/header links, and all three restore operations. The test utilities are mature and well-structured, with dedicated helpers for mocking (`mocks.ts`), state waiting (`app-state.ts`), file assertions (`file-utils.ts`), and page navigation (`navigation.ts`).

The gaps fall into four categories:

1. **Cancel path for restore dialogs** — All three restore operations (ENB presets, MO2 profiles, graphics presets) only test the confirm path. The cancel path (user dismisses the confirmation) is untested.
2. **MO2 already running when launching the game** — `mo2-launch.e2e.ts` tests MO2 already-running detection for the "Launch MO2" button on the Advanced page. The equivalent scenario for the main game launch button (home page) is untested.
3. **Error handling on Advanced page actions** — All four async actions on the Advanced page (`launchMO2`, `restoreENBPresets`, `restoreProfiles`, `restoreGraphics`) have try/catch blocks that show error dialogs, but no tests exercise these error paths.
4. **Auto-update flow** — `AutoUpdate.vue` is completely untested. It has three distinct UI states driven by IPC events (`UPDATE_AVAILABLE`, `DOWNLOAD_PROGRESS`) and no corresponding test file exists. Further analysis is required to determine how to trigger IPC events from within the test environment.

---

## Plan

### Phase 1: Cancel path for restore confirmation dialogs
- [✓] 1.1 Add cancel test to `src/__tests__/e2e/shader-options.e2e.ts`
  - [✓] 1.1.1 Test that cancelling the "Restore ENB presets" confirmation does not modify any ENB preset files
- [✓] 1.2 Add cancel test to `src/__tests__/e2e/profile-selection.e2e.ts`
  - [✓] 1.2.1 Test that cancelling the "Restore MO2 profiles" confirmation does not modify any profile files
- [✓] 1.3 Add cancel test to `src/__tests__/e2e/graphics-options.e2e.ts`
  - [✓] 1.3.1 Test that cancelling the "Restore graphics presets" confirmation does not modify any graphics preset files

### Phase 2: MO2 already running when launching the game
- [ ] 2.1 Add tests to `src/__tests__/e2e/launch-game.e2e.ts`
  - [ ] 2.1.1 Test that the MO2-already-running dialog is shown when MO2 is detected as running before game launch
  - [ ] 2.1.2 Test that the game does not launch when the user cancels the MO2-already-running dialog
  - [ ] 2.1.3 Test that MO2 processes are killed and the game launches when the user confirms the kill action

### Phase 3: Error handling on Advanced page actions
- [ ] 3.1 Add error tests to `src/__tests__/e2e/launcher-actions.e2e.ts`
  - [ ] 3.1.1 Test that an error dialog is shown when MO2 fails to launch
- [ ] 3.2 Add error tests to `src/__tests__/e2e/shader-options.e2e.ts`
  - [ ] 3.2.1 Test that an error dialog is shown when restoring ENB presets fails
- [ ] 3.3 Add error tests to `src/__tests__/e2e/profile-selection.e2e.ts`
  - [ ] 3.3.1 Test that an error dialog is shown when restoring MO2 profiles fails
- [ ] 3.4 Add error tests to `src/__tests__/e2e/graphics-options.e2e.ts`
  - [ ] 3.4.1 Test that an error dialog is shown when restoring graphics presets fails

### Phase 4: Auto-update flow tests
> **Note: Further analysis required.** It is not yet clear how to reliably trigger IPC events (`UPDATE_AVAILABLE`, `DOWNLOAD_PROGRESS`) from within the Playwright/Electron test environment. The existing `mocks.ts` patterns using `electronApp.evaluate` should be investigated before implementation begins.
- [ ] 4.1 Investigate IPC event emission from within the test environment
  - [ ] 4.1.1 Determine how to emit events from the Electron main process to the renderer during tests
  - [ ] 4.1.2 Establish whether a new mock utility is needed in `mocks.ts`
- [ ] 4.2 Create `src/__tests__/e2e/auto-update.e2e.ts`
  - [ ] 4.2.1 Test that the auto-update modal shows the "Checking for update..." loading state on open
  - [ ] 4.2.2 Test that the `UPDATE_AVAILABLE` event transitions the modal from loading to the update-available content
  - [ ] 4.2.3 Test that the `DOWNLOAD_PROGRESS` event updates the displayed download percentage

---

## File Structure (Target)

```
src/__tests__/e2e/
├── auto-update.e2e.ts          ← new file (Phase 4)
├── launch-game.e2e.ts          ← add Phase 2 tests
├── launcher-actions.e2e.ts     ← add Phase 3.1 tests
├── shader-options.e2e.ts       ← add Phase 1.1 and Phase 3.2 tests
├── profile-selection.e2e.ts    ← add Phase 1.2 and Phase 3.3 tests
└── graphics-options.e2e.ts     ← add Phase 1.3 and Phase 3.4 tests
```

---

## Key Principles

- Each new test should follow the existing pattern: `beforeEach` sets up via `startTestApp` + `setModpackAndWaitForAppLoaded`, `afterEach` calls `closeTestApp`
- Use existing mock utilities (`mockMessageBox`, `mockErrorDialog`, `replacePsListWithMock`, `replaceChildProcessExecWithMock`) rather than introducing new ones
- Cancel path tests should assert file contents are unchanged, not just that no error was thrown
- Auto-update tests (Phase 4) require further analysis before implementation — see the note in Phase 4

---

## Success Criteria

- All four phases are complete with no failing tests
- No existing tests are broken by additions
- Cancel path tests assert file contents are unchanged after cancelling
- Auto-update tests cover all three modal states
- Error handling tests verify the correct error dialog title and message content

---

## Notes

- Phase 2 (MO2 running on game launch) should reference `mo2-launch.e2e.ts` for patterns around `replacePsListWithMock` and `waitForMessageBoxShown`
- Phase 4 (auto-update) requires upfront analysis before writing any tests — the mechanism for emitting IPC events from the main process to the renderer in a Playwright/Electron test context is not yet established

# Missing E2E Tests Plan

## Overview

This plan tracks the identification and addition of missing e2e tests across the Wildlander Launcher application. A full audit of existing e2e test coverage was conducted against the application's features and user flows. Five areas of missing coverage were identified, ranging from entirely untested features (auto-update) to missing edge cases in otherwise well-tested areas (cancel paths, error handling).

**Status**: Phase 3.4 Complete

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
- [✓] 2.1 Add tests to `src/__tests__/e2e/launch-game.e2e.ts`
  - [✓] 2.1.1 Test that the MO2-already-running dialog is shown when MO2 is detected as running before game launch
  - [✓] 2.1.2 Test that the game does not launch when the user cancels the MO2-already-running dialog
  - [✓] 2.1.3 Test that MO2 processes are killed and the game launches when the user confirms the kill action

### Phase 3: Error handling on Advanced page actions
- [✓] 3.1 Add error tests to `src/__tests__/e2e/launcher-actions.e2e.ts`
  - [✓] 3.1.1 Test that an error dialog is shown when MO2 fails to launch
- [✓] 3.2 Add error tests to `src/__tests__/e2e/shader-options.e2e.ts`
  - [✓] 3.2.1 Test that an error dialog is shown when restoring ENB presets fails
- [✓] 3.3 Add error tests to `src/__tests__/e2e/profile-selection.e2e.ts`
  - [✓] 3.3.1 Test that an error dialog is shown when restoring MO2 profiles fails
- [✓] 3.4 Add error tests to `src/__tests__/e2e/graphics-options.e2e.ts`
  - [✓] 3.4.1 Test that an error dialog is shown when restoring graphics presets fails

### Phase 4: Auto-update flow tests

#### Analysis findings

**Component (`AutoUpdate.vue`):** Three UI states, all driven passively by IPC — no user interactions. All required `data-testid` attributes are already present: `auto-update-loading`, `auto-update-content`, `auto-update-progress`.

**Startup flow:** `UpdateService.update()` is called during app startup. It loads the `/auto-update` route into the main `BrowserWindow`, then resolves (continuing startup) when either `UPDATE_NOT_AVAILABLE` fires or `shouldUpdate()` returns false. In tests `IS_TEST: "true"` → `isDevelopment: true` → `shouldUpdate()` returns false, so the app skips the update check and immediately navigates away. `waitForPreloadComplete` in `setup.ts` already handles this timing.

**IPC channels (from `update.events.ts`):**
- `update-available` — main → renderer, no payload
- `download-progress` — main → renderer, payload: `number` (0–100, floored)
- `update-not-available` — internal to main process only; not forwarded to renderer
- `update-downloaded` — internal; triggers `quitAndInstall()` automatically — must **never** be fired in tests

**How to emit IPC events in tests:** `webContents.send()` can be called directly via `electronApp.evaluate`, bypassing `UpdateService` and `autoUpdater` entirely:

```typescript
await electronApp.evaluate(({ BrowserWindow }, channel) => {
  BrowserWindow.getAllWindows()[0].webContents.send(channel);
}, 'update-available');
```

This is the same pattern as `mockErrorDialog` and `mockMessageBox`, which override Electron APIs inside `electronApp.evaluateHandle`. A small `sendIpcToRenderer` helper in `mocks.ts` is sufficient — no new mock infrastructure is needed.

**How to reach the `/auto-update` route in tests:** After `startTestApp`, navigate to the route programmatically before calling `setModpackAndWaitForAppLoaded`. The component's `created()` hook re-registers IPC listeners on every navigation to the route.

**Testing strategy — what to test vs. what to skip:**

| Scenario | Test? | Reason |
|---|---|---|
| Component shows loading state initially | Yes | Verifiable without any IPC events |
| `UPDATE_AVAILABLE` transitions loading → content | Yes | Core UI state transition |
| `DOWNLOAD_PROGRESS` updates percentage in DOM | Yes | Core UI state transition; verify with a specific value |
| `UPDATE_NOT_AVAILABLE` / app navigates away | Skip | Internal to main process; not visible in renderer |
| `UPDATE_DOWNLOADED` / `quitAndInstall()` | **Never** | Would kill the Electron process mid-test |
| Error dialog on `autoUpdater` failure | Skip | Covered by unit tests; low value since `shouldUpdate()` is false in test env anyway |

**What this does NOT test (and that's fine):** Whether `autoUpdater.checkForUpdates()` contacts a server, whether electron-updater fires events correctly, or whether `quitAndInstall()` restarts the process. These are third-party library behaviours. The e2e tests give confidence that the UI correctly reflects update state when the main process sends the appropriate signals.

- [ ] 4.1 Add `sendIpcToRenderer` helper to `src/__tests__/e2e/util/mocks.ts`
  - [ ] 4.1.1 Helper accepts `electronApp`, a channel name, and an optional payload; calls `webContents.send()` from the main process via `electronApp.evaluate`
- [ ] 4.2 Create `src/__tests__/e2e/auto-update.e2e.ts`
  - [ ] 4.2.1 Test that navigating to `/auto-update` shows the "Checking for update..." loading state
  - [ ] 4.2.2 Test that sending `update-available` transitions the modal from loading state to update-available content
  - [ ] 4.2.3 Test that sending `download-progress` with a value (e.g. 42) updates the displayed percentage in `auto-update-progress`

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
- Auto-update tests use `sendIpcToRenderer` (a new thin helper) to emit IPC events directly via `webContents.send()` — no `autoUpdater` mocking required

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
- Phase 4 (auto-update): IPC events are emitted directly via `electronApp.evaluate` + `webContents.send()`, bypassing `UpdateService` and `autoUpdater` entirely. `UPDATE_DOWNLOADED` must never be emitted in tests as it triggers `quitAndInstall()` and kills the process.

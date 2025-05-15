import { expect, Locator, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  setModpackAndWaitForAppLoaded,
  startTestApp,
} from "./util/setup";
import type { ElectronApplication } from "playwright";
import {
  waitForClickEventsDisabled,
  waitForClickEventsEnabled,
  waitForMessageBoxShown,
} from "./util/app-state";
import {
  mockMessageBox,
  mockProcessKill,
  replaceChildProcessExecWithManualResolveMock,
  replaceChildProcessExecWithMock,
  replacePsListWithMock,
} from "./util/mocks";
import { MO2_NAMES } from "@/shared/enums/mo2";
import { PROFILES, selectProfile } from "./util/profile";
import fsPromises from "fs/promises";
import { IIniObjectSection, parse } from "js-ini";
import { getDisplayTweaksIni } from "./util/modlist";
import { selectResolution } from "./util/resolution";
import path from "path";
import { PAGES, navigateAndWait } from "./util/navigation";

/**
 * Reads the MO2 settings file and returns the selected profile
 * @param mockFiles The path to the mock files directory
 * @returns The selected profile from the MO2 settings file
 */
const getMO2SelectedProfile = async (
  mockFiles: MockFilesPaths
): Promise<string> => {
  const mo2SettingsPath = path.join(
    mockFiles.mockModpackPath,
    MO2_NAMES.MO2Settings
  );
  const mo2SettingsContent = await fsPromises.readFile(
    mo2SettingsPath,
    "utf-8"
  );
  const settings = parse(mo2SettingsContent);

  // The selected profile is stored in the General section as @ByteArray(profile_name)
  const selectedProfileSetting = (settings.General as IIniObjectSection)
    ?.selected_profile as string;

  // Extract the profile name from @ByteArray(profile_name)
  const match = selectedProfileSetting.match(/@ByteArray\((.*)\)/);
  if (match?.[1]) {
    return match[1];
  }

  throw new Error(
    `Could not extract profile name from ${selectedProfileSetting}`
  );
};

test.describe("MO2 Launch", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;
  let launchButton: Locator;

  test.beforeEach(async () => {
    ({ window, closeTestApp, electronApp, mockFiles } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);

    const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);
    launchButton = advancedPage.getByTestId("launch-mo2");
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should show the MO2 launch button on the advanced page", async () => {
    await expect(launchButton).toBeVisible();

    const disabledPromise = waitForClickEventsDisabled(window);

    const execHandle = await replaceChildProcessExecWithMock(electronApp);

    await launchButton.click();

    await disabledPromise;

    await waitForClickEventsEnabled(window);

    // Retrieve the file path from the mock exec function
    const file = await execHandle.evaluate((f) => f());

    expect(file).toBe(
      `"${path.join(mockFiles.mockModpackPath, "ModOrganizer.exe")}"`
    );
  });

  test("should show dialog when MO2 is already running", async () => {
    await expect(launchButton).toBeVisible();

    // Mock PSList to indicate MO2 is already running
    await replacePsListWithMock(electronApp, [
      {
        name: MO2_NAMES.MO2EXE,
        pid: 12345,
        ppid: 1,
        cmd: "ModOrganizer.exe",
        cpu: 0,
        memory: 0,
      },
    ]);

    // Mock message box to capture the message box shown
    const messageBoxHandle = await mockMessageBox(electronApp, 0);

    // Wait for click events to be disabled when the dialog is shown
    const disabledPromise = waitForClickEventsDisabled(window);

    await launchButton.click();

    // Wait for the UI to be disabled (dialog is shown)
    await disabledPromise;

    // Wait for the message box to be shown and then get the message box details
    const messageBoxDetails = await waitForMessageBoxShown(messageBoxHandle);

    // Assert that the message box was shown with the correct title and message
    expect(messageBoxDetails).toEqual({
      messageBoxShown: true,
      messageBoxTitle: "Mod Organizer running",
      messageBoxMessage:
        "Mod Organizer 2 is already running. This could launch the wrong mod list. Would you like to close it first?",
    });
  });

  test("should call process.kill when user selects to kill MO2", async () => {
    await expect(launchButton).toBeVisible();

    // Mock PSList to indicate MO2 is already running with a specific PID
    const mockPid = 12345;
    await replacePsListWithMock(electronApp, [
      {
        name: MO2_NAMES.MO2EXE,
        pid: mockPid,
        ppid: 1,
        cmd: "ModOrganizer.exe",
        cpu: 0,
        memory: 0,
      },
    ]);

    await replaceChildProcessExecWithMock(electronApp);

    // Mock process.kill to capture what it was called with
    const processKillHandle = await mockProcessKill(electronApp);

    // Mock message box to return response number 1 (user selects "Close MO2 and continue")
    await mockMessageBox(electronApp, 1);

    // Wait for click events to be disabled when the dialog is shown
    const disabledPromise = waitForClickEventsDisabled(window);

    await launchButton.click();

    // Wait for the UI to be disabled (dialog is shown)
    await disabledPromise;

    // Wait for click events to be enabled again (dialog is closed)
    await waitForClickEventsEnabled(window);

    // Get the process.kill mock state
    const processKillState = await processKillHandle.evaluate((f) => f());

    // Assert that process.kill was called
    expect(processKillState.calls).toBeGreaterThan(0);

    // Assert that process.kill was called with the correct PID
    expect(processKillState.lastCalledWith?.pid).toBe(mockPid);
  });

  test("should update selected profile in MO2 settings before launch", async () => {
    await expect(launchButton).toBeVisible();

    const selectedProfile = await selectProfile(window, PROFILES.STANDARD);

    await replaceChildProcessExecWithMock(electronApp);

    // Wait for click events to be disabled when launching
    const disabledPromise = waitForClickEventsDisabled(window);

    await launchButton.click();

    // Wait for the UI to be disabled (launching)
    await disabledPromise;

    // Wait for click events to be enabled again (launch complete)
    await waitForClickEventsEnabled(window);

    const mo2SelectedProfile = await getMO2SelectedProfile(mockFiles);

    // Assert that the selected profile in the MO2 settings file matches the profile we selected
    expect(mo2SelectedProfile).toBe(selectedProfile);
  });

  test("should update resolution in graphics settings before launch", async () => {
    await expect(launchButton).toBeVisible();

    const selectedResolution = await selectResolution(window, {
      width: 1920,
      height: 1080,
    });

    await replaceChildProcessExecWithMock(electronApp);

    // Wait for click events to be disabled when launching
    const disabledPromise = waitForClickEventsDisabled(window);

    await launchButton.click();

    // Wait for the UI to be disabled (launching)
    await disabledPromise;

    // Wait for click events to be enabled again (launch complete)
    await waitForClickEventsEnabled(window);

    const displayTweaksIni = await getDisplayTweaksIni(mockFiles);
    const resolution = displayTweaksIni.Render.Resolution;

    expect(resolution).toBe(
      `${selectedResolution.width}x${selectedResolution.height}`
    );
  });

  test("should kill all MO2 processes when clicking the kill button", async () => {
    await expect(launchButton).toBeVisible();

    const mockRunningProcesses = [
      {
        name: MO2_NAMES.MO2EXE,
        pid: 12345,
        ppid: 1,
        cmd: "ModOrganizer.exe",
        cpu: 0,
        memory: 0,
      },
      {
        name: MO2_NAMES.MO2EXE,
        pid: 67890,
        ppid: 1,
        cmd: "ModOrganizer.exe",
        cpu: 0,
        memory: 0,
      },
      {
        name: MO2_NAMES.MO2EXE,
        pid: 54321,
        ppid: 1,
        cmd: "ModOrganizer.exe",
        cpu: 0,
        memory: 0,
      },
      // Add a non-MO2 process to ensure it's not killed
      {
        name: "SomeOtherProcess.exe",
        pid: 99999,
        ppid: 1,
        cmd: "SomeOtherProcess.exe",
        cpu: 0,
        memory: 0,
      },
    ];

    const processKillHandle = await mockProcessKill(electronApp);

    // Use the manual resolve mock to simulate a long-running exec
    const execHandle = await replaceChildProcessExecWithManualResolveMock(
      electronApp
    );

    await launchButton.click();

    // Now mock the PSList to indicate MO2 is running
    // This simulates MO2 starting to run after the launch button is clicked
    await replacePsListWithMock(electronApp, mockRunningProcesses);

    // Wait for the MO2 running modal to appear and the kill button to be visible
    const killButton = window.getByTestId("kill-mo2-processes");
    await killButton.waitFor({ state: "visible" });
    await killButton.click();

    // Manually resolve the exec promise to simulate MO2 being closed by the kill button
    await execHandle.evaluate((handle) => handle.resolveExec());

    const processKillState = await processKillHandle.evaluate((f) => f());

    expect(processKillState.calls).toBe(3);
    // Assert that process.kill was called with the correct PIDs for all MO2 processes
    const killedPids = processKillState.allCalledWith.map((call) => call.pid);
    expect(killedPids).toEqual([12345, 67890, 54321]);
  });
});

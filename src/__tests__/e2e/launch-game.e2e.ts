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
  replaceChildProcessExecWithMock,
  replacePsListWithMock,
} from "./util/mocks";
import { MO2_NAMES } from "@/shared/enums/mo2";
import { PROFILES, selectProfile } from "./util/profile";
import {
  IIniObject,
  IIniObjectSection,
  IniValue,
  parse,
  stringify,
} from "js-ini";
import path from "path";
import fsPromises from "fs/promises";
import { ENB_PRESETS, selectEnb } from "./util/enb";
import { GRAPHICS_PRESETS, selectGraphics } from "./util/graphics";

/**
 * Gets the MO2 settings path and settings object
 */
const getMO2Settings = async (
  mockFiles: MockFilesPaths
): Promise<{ mo2SettingsPath: string; settings: IIniObject }> => {
  const mo2SettingsPath = path.join(
    mockFiles.mockModpackPath,
    MO2_NAMES.MO2Settings
  );
  const mo2SettingsContent = await fsPromises.readFile(
    mo2SettingsPath,
    "utf-8"
  );
  const settings = parse(mo2SettingsContent);
  return { mo2SettingsPath, settings };
};

/**
 * Reads the MO2 settings file and returns the lock_gui setting
 * @param mockFiles The path to the mock files directory
 * @returns The lock_gui setting from the MO2 settings file
 */
const getMO2LockGuiSetting = async (
  mockFiles: MockFilesPaths
): Promise<IniValue> => {
  const { settings } = await getMO2Settings(mockFiles);
  return (settings.Settings as IIniObjectSection)?.lock_gui as IniValue;
};

/**
 * Sets the lock_gui setting in the MO2 settings file
 * @param mockFiles The path to the mock files directory
 * @param value The value to set lock_gui to
 */
const setMO2LockGuiSetting = async (
  mockFiles: MockFilesPaths,
  value: boolean
): Promise<void> => {
  const { mo2SettingsPath, settings } = await getMO2Settings(mockFiles);
  if (!settings.Settings) {
    settings.Settings = {};
  }
  (settings.Settings as IIniObjectSection).lock_gui = value.toString();
  await fsPromises.writeFile(mo2SettingsPath, stringify(settings));
};

test.describe("Launch Game", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;
  let launchGameButton: Locator;
  let execHandle: Awaited<ReturnType<typeof replaceChildProcessExecWithMock>>;

  test.beforeEach(async () => {
    ({ window, closeTestApp, electronApp, mockFiles } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window);
    launchGameButton = window.getByTestId("launch-game");
    execHandle = await replaceChildProcessExecWithMock(electronApp);
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should launch game with correct command when clicking the launch game button", async () => {
    // Select the Performance profile so a known profile is used
    const selectedProfile = await selectProfile(window, PROFILES.PERFORMANCE);

    await launchGameButton.click();

    await execHandle.evaluate((handle) => handle.resolveExec());
    await waitForClickEventsEnabled(window);

    const command = await execHandle.evaluate((handle) => handle.getCommand());

    // Assert that the command is correct
    expect(command).toBe(
      `"${path.join(
        mockFiles.mockModpackPath,
        "ModOrganizer.exe"
      )}" -p "${selectedProfile}" "moshortcut://:SKSE"`
    );
  });

  test("should disable locking the gui when the game is running", async () => {
    await setMO2LockGuiSetting(mockFiles, true);

    await launchGameButton.click();
    await execHandle.evaluate((handle) => handle.waitForExec());

    const lockGuiAfterLaunch = await getMO2LockGuiSetting(mockFiles);
    expect(
      lockGuiAfterLaunch,
      "MO2 lock_gui setting should be disabled when game is launched"
    ).toBe(false);

    await execHandle.evaluate((handle) => handle.resolveExec());
    await waitForClickEventsEnabled(window);

    const lockGuiAfterPostLaunch = await getMO2LockGuiSetting(mockFiles);
    expect(
      lockGuiAfterPostLaunch,
      "MO2 lock_gui setting should be restored to enabled after game exit"
    ).toBe(true);
  });

  test("should copy Skyrim launch logs after game completion", async () => {
    const skyrimDirectory = path.join(mockFiles.mockModpackPath, "Stock Game");
    const launchLogPath = path.join(skyrimDirectory, "d3dx9_42.log");

    await launchGameButton.click();

    await execHandle.evaluate((handle) => handle.waitForExec());

    // Create a unique content for the log file
    const uniqueContent = `Test log content ${Date.now()}`;

    // Ensure the directory exists
    await fsPromises.mkdir(skyrimDirectory, { recursive: true });
    // Write unique content to the log file
    await fsPromises.writeFile(launchLogPath, uniqueContent);

    // Resolve the exec call to simulate game exiting
    await execHandle.evaluate((handle) => handle.resolveExec());

    // Wait for click events to be enabled (indicating the process has completed)
    await waitForClickEventsEnabled(window);

    // Verify the log file was copied correctly
    const logDirectory = path.join(mockFiles.mockFilesPath, "logs");
    const copiedLogPath = path.join(logDirectory, "skyrim-launch-logs.log");

    // Read the content of the copied log file
    const copiedContent = await fsPromises.readFile(copiedLogPath, "utf-8");

    // Assert that the content matches
    expect(
      copiedContent,
      "Graphics files should be correctly synced back to preset directory after game completion"
    ).toBe(uniqueContent);
  });

  test("should sync ENB files from game to presets after game completion", async () => {
    const skyrimDirectory = path.join(mockFiles.mockModpackPath, "Stock Game");
    const enbFilePath = path.join(skyrimDirectory, "enblocal.ini");

    await selectEnb(window, ENB_PRESETS.HIGH);

    await launchGameButton.click();

    await execHandle.evaluate((handle) => handle.waitForExec());

    // Create a unique content for the ENB file
    const uniqueContent = `; Test ENB content ${Date.now()}`;

    // Ensure the directory exists
    await fsPromises.mkdir(skyrimDirectory, { recursive: true });
    // Write unique content to the ENB file
    await fsPromises.writeFile(enbFilePath, uniqueContent);

    // Resolve the exec call to simulate game exiting
    await execHandle.evaluate((handle) => handle.resolveExec());

    // Wait for click events to be enabled (indicating the process has completed)
    await waitForClickEventsEnabled(window);

    // Verify the ENB file was copied back to the preset directory
    const enbPresetDirectory = path.join(
      mockFiles.mockModpackPath,
      "launcher",
      "ENB Presets",
      ENB_PRESETS.HIGH.value
    );
    const copiedEnbFilePath = path.join(enbPresetDirectory, "enblocal.ini");

    // Read the content of the copied ENB file
    const copiedContent = await fsPromises.readFile(copiedEnbFilePath, "utf-8");

    // Assert that the content matches
    expect(
      copiedContent,
      "Skyrim launch logs should be correctly copied after game completion"
    ).toBe(uniqueContent);
  });

  test("should show MO2 already running dialog when MO2 is running before game launch", async () => {
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

    const messageBoxHandle = await mockMessageBox(electronApp, 0);

    const disabledPromise = waitForClickEventsDisabled(window);

    await launchGameButton.click();

    await disabledPromise;

    const messageBoxDetails = await waitForMessageBoxShown(messageBoxHandle);

    expect(messageBoxDetails).toEqual({
      messageBoxShown: true,
      messageBoxTitle: "Mod Organizer running",
      messageBoxMessage:
        "Mod Organizer 2 is already running. This could launch the wrong mod list. Would you like to close it first?",
    });
  });

  test("should not launch game when user cancels the MO2-already-running dialog", async () => {
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

    // Response 0 = Cancel
    await mockMessageBox(electronApp, 0);

    const disabledPromise = waitForClickEventsDisabled(window);

    await launchGameButton.click();

    // Wait for the dialog to appear then disappear (flow has completed)
    await disabledPromise;
    await waitForClickEventsEnabled(window);

    const command = await execHandle.evaluate((handle) => handle.getCommand());

    expect(command).toBeUndefined();
  });

  test("should kill MO2 processes and launch game when user confirms the MO2-already-running dialog", async () => {
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

    const processKillHandle = await mockProcessKill(electronApp);

    // Response 1 = "Close MO2 and continue"
    await mockMessageBox(electronApp, 1);

    await launchGameButton.click();

    await execHandle.evaluate((handle) => handle.resolveExec());
    await waitForClickEventsEnabled(window);

    const processKillState = await processKillHandle.evaluate((f) => f());
    expect(processKillState.calls).toBeGreaterThan(0);
    expect(processKillState.lastCalledWith?.pid).toBe(mockPid);

    const command = await execHandle.evaluate((handle) => handle.getCommand());
    expect(command).toBeDefined();
  });

  test("should sync graphics files from game to profile after game completion", async () => {
    const fileToEdit = "Skyrim.ini";
    const profileDir = path.normalize(
      `${mockFiles.mockModpackPath}/profiles/${PROFILES.STANDARD.value}`
    );
    const profileFilePath = path.normalize(`${profileDir}/${fileToEdit}`);
    const graphicsPresetsDir = path.normalize(
      `${mockFiles.mockModpackPath}/launcher/Graphics Presets/${GRAPHICS_PRESETS.HIGH.value}`
    );
    const presetFilePath = path.normalize(
      `${graphicsPresetsDir}/${fileToEdit}`
    );

    await selectProfile(window, PROFILES.STANDARD);
    await selectGraphics(window, GRAPHICS_PRESETS.HIGH);

    await launchGameButton.click();

    await execHandle.evaluate((handle) => handle.waitForExec());

    const uniqueContent = `; Test graphics content ${Date.now()}\n[Display]\nsInterfaceMode=1\n`;

    await fsPromises.writeFile(profileFilePath, uniqueContent);

    // Resolve the exec call to simulate game exiting
    await execHandle.evaluate((handle) => handle.resolveExec());

    // Wait for click events to be enabled (indicating the process has completed)
    await waitForClickEventsEnabled(window);

    // Read the content of the copied graphics file
    const copiedContent = await fsPromises.readFile(presetFilePath, "utf-8");

    // Assert that the content matches
    expect(
      copiedContent,
      "ENB files should be correctly synced back to preset directory after game completion"
    ).toBe(uniqueContent);
  });
});

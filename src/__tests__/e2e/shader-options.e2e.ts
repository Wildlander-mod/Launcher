import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  setModpackAndWaitForAppLoaded,
  startTestApp,
} from "./util/setup";
import { mockMessageBox, replaceChildProcessExecWithMock } from "./util/mocks";
import type { ElectronApplication } from "playwright";
import { getUserPreferences } from "./util/user-preferences";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { fileContains, filesDoNotExist, filesExist } from "./util/file-utils";
import fs from "fs/promises";
import path from "path";
import {
  gameExited,
  gameLaunched,
  waitForClickEventsEnabled,
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
  waitForMessageBoxShown,
} from "./util/app-state";
import { isPluginEnabled } from "./util/modlist";

/**
 * Hardcoded ENB presets configuration based on the mock namesENB.json file
 * - value: The actual preset name used in the system
 * - text: The display text shown to the user
 */
const ENB_PRESETS = {
  ULTRA: {
    value: "1_Shaders_ULTRA",
    text: "Ultra Shaders",
  },
  HIGH: {
    value: "1_Shaders_HIGH",
    text: "High Shaders",
  },
  LOW: {
    value: "1_Shaders_LOW",
    text: "Low Shaders",
  },
  NO_SHADERS: {
    value: "noEnb",
    text: "No Shaders",
  },
};

/**
 * Helper function to select an ENB preset from the dropdown
 * @param window The Playwright Page object
 * @param preset The ENB preset object to select
 * @returns The selected ENB preset value (used for verification in tests)
 */
const selectEnb = async (
  window: Page,
  preset: (typeof ENB_PRESETS)[keyof typeof ENB_PRESETS]
) => {
  const enbDropdown = window.getByTestId("enb-dropdown");
  await enbDropdown.getByTestId("dropdown-head").click();

  // Get the promise for waiting for the button to be disabled before clicking
  // This ensures we capture the disabled state even if it happens very quickly
  const disabledPromise = waitForLaunchButtonDisabled(window);

  // Select the ENB preset
  const optionsContainer = enbDropdown.getByTestId("dropdown-options");
  await optionsContainer.getByText(preset.text).click();

  // Now await the promise to ensure the button was disabled at least once after the click
  await disabledPromise;

  // Wait for the ENB change to complete (button enabled again)
  await waitForLaunchButtonEnabled(window);

  return preset.value;
};

test.describe("Shader Options", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    ({ window, closeTestApp, mockFiles, electronApp } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should display the ENB dropdown", async () => {
    const enbDropdown = window.getByTestId("enb-dropdown");
    await expect(enbDropdown).toBeVisible();
  });

  test("should update user preferences when changing ENB preset", async () => {
    const selectedEnbValue = await selectEnb(window, ENB_PRESETS.NO_SHADERS);

    const updatedPreferences = await getUserPreferences(
      mockFiles.mockFilesPath
    );
    const updatedEnbPreference =
      updatedPreferences[USER_PREFERENCE_KEYS.ENB_PROFILE];

    expect(updatedEnbPreference).toBe(selectedEnbValue);
  });

  test("should disable the Launch Game button during ENB changes", async () => {
    const launchButton = window.getByTestId("launch-game");

    // Verify the button is initially enabled
    await expect(launchButton).not.toHaveClass(/c-button--disabled/);

    // This will trigger the ENB change and wait for it to complete
    await selectEnb(window, ENB_PRESETS.LOW);

    // Verify the button is re-enabled after the ENB change is complete
    await expect(launchButton).not.toHaveClass(/c-button--disabled/);
  });

  test("should copy ENB files to Skyrim directory when changing ENB preset", async () => {
    await selectEnb(window, ENB_PRESETS.HIGH);

    // Verify the ENB files were copied to the Skyrim directory
    const enbDir = `${mockFiles.mockModpackPath}/launcher/ENB Presets/${ENB_PRESETS.HIGH.value}`;
    const skyrimDir = `${mockFiles.mockModpackPath}/Stock Game`;

    // Verify all files from the ENB directory exist in the Skyrim directory
    const allFilesExist = await filesExist(enbDir, skyrimDir);
    expect(allFilesExist).toBe(true);
  });

  test("should remove ENB files from Skyrim directory when selecting No Shaders", async () => {
    await selectEnb(window, ENB_PRESETS.HIGH);

    // Verify the ENB files were copied to the Skyrim directory
    const enbDir = `${mockFiles.mockModpackPath}/launcher/ENB Presets/${ENB_PRESETS.HIGH.value}`;
    const skyrimDir = `${mockFiles.mockModpackPath}/Stock Game`;

    const filesExistBefore = await filesExist(enbDir, skyrimDir);
    expect(filesExistBefore).toBe(true);

    await selectEnb(window, ENB_PRESETS.NO_SHADERS);

    // Verify ALL ENB files were removed from the Skyrim directory
    // This ensures that every single file from the preset has been removed
    const allFilesRemoved = await filesDoNotExist(enbDir, skyrimDir);
    expect(allFilesRemoved).toBe(true);
  });

  test("should sync modified ENB files back to preset directory when changing ENB preset", async () => {
    await selectEnb(window, ENB_PRESETS.HIGH);

    const highEnbDir = `${mockFiles.mockModpackPath}/launcher/ENB Presets/${ENB_PRESETS.HIGH.value}`;
    const skyrimDir = `${mockFiles.mockModpackPath}/Stock Game`;

    const fileToModify = "enblocal.ini";
    const originalFilePath = path.join(highEnbDir, fileToModify);
    const copiedFilePath = path.join(skyrimDir, fileToModify);

    const modificationText = "#This is a test modification";
    const originalEnbLocal = await fs.readFile(copiedFilePath, "utf-8");
    await fs.writeFile(
      copiedFilePath,
      originalEnbLocal + "\n" + modificationText
    );

    // Mock the exec method to prevent actual game launch
    await replaceChildProcessExecWithMock(electronApp);

    const launchButton = window.getByTestId("launch-game");

    const gameLaunchedPromise = gameLaunched(window);

    await launchButton.click();

    // Confirm the game is launched before continuing
    await gameLaunchedPromise;

    await gameExited(window);

    await selectEnb(window, ENB_PRESETS.LOW);

    // Verify the modified enblocal.ini file was synced back to the original ENB preset directory
    expect(await fileContains(originalFilePath, modificationText)).toBe(true);
  });

  test("should create ENB backups on app start", async () => {
    // The backup should already be created during app initialization
    const originalEnbDir = `${mockFiles.mockModpackPath}/launcher/ENB Presets`;
    const backupEnbDir = `${mockFiles.mockModpackPath}/launcher/_backups/ENB Presets`;

    // Verify the backup directory exists
    expect(async () => fs.access(backupEnbDir)).not.toThrow();

    // Verify all files from the original ENB directory exist in the backup directory with the same structure
    // This recursively checks that all files and subdirectories match
    const allFilesExistRecursively = await filesExist(
      originalEnbDir,
      backupEnbDir
    );
    expect(allFilesExistRecursively).toBe(true);
  });

  test("should disable NightEyeENBFix_PredatorVision.esp plugin when selecting No Shaders and re-enable when selecting High preset", async () => {
    // First, select a shader preset to ensure we're starting from a known state
    await selectEnb(window, ENB_PRESETS.HIGH);

    await selectEnb(window, ENB_PRESETS.NO_SHADERS);

    // Verify the NightEyeENBFix_PredatorVision.esp plugin is disabled
    const isPluginDisabled = !(await isPluginEnabled(
      "NightEyeENBFix_PredatorVision.esp",
      mockFiles
    ));

    expect(isPluginDisabled).toBe(true);

    await selectEnb(window, ENB_PRESETS.HIGH);

    // Verify the plugin is enabled again
    const isPluginEnabledAgain = await isPluginEnabled(
      "NightEyeENBFix_PredatorVision.esp",
      mockFiles
    );

    expect(isPluginEnabledAgain).toBe(true);
  });

  test("should restore ENB presets when clicking the Restore ENB Presets button", async () => {
    const fileToModify = "enbseries.ini";
    const originalFilePath = path.join(
      `${mockFiles.mockModpackPath}/launcher/ENB Presets/${ENB_PRESETS.LOW.value}/${fileToModify}`
    );
    const backupFilePath = path.join(
      `${mockFiles.mockModpackPath}/launcher/_backups/ENB Presets/${ENB_PRESETS.LOW.value}/${fileToModify}`
    );

    await window
      .getByTestId("navigation-container")
      .getByText("Advanced")
      .click();
    await window.getByTestId("page-advanced").waitFor({ state: "visible" });

    // Select a shader preset to ensure we're starting from a known state
    await selectEnb(window, ENB_PRESETS.LOW);

    const originalContent = await fs.readFile(originalFilePath, "utf-8");
    const backupContent = await fs.readFile(backupFilePath, "utf-8");

    await fs.writeFile(
      originalFilePath,
      originalContent + "\n#This is a test modification for restore test"
    );

    const messageBoxHandle = await mockMessageBox(electronApp, 1);

    await window.getByTestId("restore-enb-presets").click();

    await waitForMessageBoxShown(messageBoxHandle);
    await waitForClickEventsEnabled(window);

    const restoredContent = await fs.readFile(originalFilePath, "utf-8");
    const currentBackupContent = await fs.readFile(backupFilePath, "utf-8");

    // Verify the content of the restored file matches the backup file
    expect(restoredContent).toBe(currentBackupContent);
    // Verify the backup file was not modified during the restore process
    expect(currentBackupContent).toBe(backupContent);
  });
});

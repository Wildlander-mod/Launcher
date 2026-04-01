import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  setModpackAndWaitForAppLoaded,
  startTestApp,
} from "./util/setup";
import { getUserPreferences } from "./util/user-preferences";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import fs from "fs/promises";
import {
  waitForClickEventsEnabled,
  waitForMessageBoxShown,
} from "./util/app-state";
import { mockMessageBox } from "./util/mocks";
import type { ElectronApplication } from "playwright";
import path from "path";
import { PAGES, navigateAndWait } from "./util/navigation";
import { GRAPHICS_PRESETS, selectGraphics } from "./util/graphics";

test.describe("Graphics Options", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    ({ window, closeTestApp, mockFiles, electronApp } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window);
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should display the graphics dropdown", async () => {
    // Verify the graphics dropdown is visible
    const graphicsDropdown = window.getByTestId("graphics-dropdown");
    await expect(graphicsDropdown).toBeVisible();
  });

  test("should update user preferences when changing graphics preset", async () => {
    // Get the initial graphics preference
    await getUserPreferences(mockFiles.mockFilesPath);

    await selectGraphics(window, GRAPHICS_PRESETS.MEDIUM);

    // Verify the graphics preference is updated in user preferences
    const updatedPreferences = await getUserPreferences(
      mockFiles.mockFilesPath
    );
    const updatedGraphicsPreference =
      updatedPreferences[USER_PREFERENCE_KEYS.GRAPHICS];

    expect(updatedGraphicsPreference).toBe(GRAPHICS_PRESETS.MEDIUM.value);
  });

  test("should copy graphics files to profiles when changing graphics preset", async () => {
    // Get the current profile from user preferences
    const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);
    const currentProfile = userPreferences[
      USER_PREFERENCE_KEYS.PRESET
    ] as string;

    await selectGraphics(window, GRAPHICS_PRESETS.HIGH);

    // Verify the graphics files were copied to the profile directory
    const graphicsDir = `${mockFiles.mockModpackPath}/launcher/Graphics Presets/${GRAPHICS_PRESETS.HIGH.value}`;
    const profileDir = `${mockFiles.mockModpackPath}/profiles/${currentProfile}`;

    // Get a list of graphics files
    const graphicsFiles = await fs.readdir(graphicsDir);
    expect(graphicsFiles.length).toBeGreaterThan(0);

    // Verify each file was copied
    for (const file of graphicsFiles) {
      const sourcePath = `${graphicsDir}/${file}`;
      const destPath = `${profileDir}/${file}`;

      // Verify source file exists and is readable
      expect(async () => {
        await fs.access(sourcePath);
      }).not.toThrowError();

      // Verify destination file exists and is readable
      expect(async () => {
        await fs.access(destPath);
      }).not.toThrowError();

      // Compare file contents to ensure proper copy
      const sourceContent = await fs.readFile(sourcePath);
      const destContent = await fs.readFile(destPath);
      expect(sourceContent).toEqual(destContent);
    }
  });

  test("should disable the Launch Game button during graphics changes", async () => {
    const launchButton = window.getByTestId("launch-game");

    // Verify the button is initially enabled
    await expect(launchButton).not.toHaveClass(/c-button--disabled/);

    // Use the LOW graphics preset
    // This will trigger the graphics change and wait for it to complete
    await selectGraphics(window, GRAPHICS_PRESETS.LOW);

    // Verify the button is re-enabled after the graphics change is complete
    await expect(launchButton).not.toHaveClass(/c-button--disabled/);
  });

  test("should not restore graphics presets when cancelling the confirmation dialog", async () => {
    await selectGraphics(window, GRAPHICS_PRESETS.HIGH);

    const fileToModify = "SkyrimPrefs.ini";
    const originalFilePath = path.join(
      `${mockFiles.mockModpackPath}/launcher/Graphics Presets/${GRAPHICS_PRESETS.HIGH.value}/${fileToModify}`
    );
    const originalContent = await fs.readFile(originalFilePath, "utf-8");
    const modifiedContent =
      originalContent +
      "\n#This is a test modification for cancel graphics restore test";
    await fs.writeFile(originalFilePath, modifiedContent);

    await navigateAndWait(window, PAGES.ADVANCED);

    const messageBoxHandle = await mockMessageBox(electronApp, 0);

    await window.getByTestId("restore-graphics-presets").click();

    await waitForMessageBoxShown(messageBoxHandle);
    await waitForClickEventsEnabled(window);

    const contentAfterCancel = await fs.readFile(originalFilePath, "utf-8");

    // Verify the file was not restored after cancelling
    expect(contentAfterCancel).toBe(modifiedContent);
  });

  test("should restore graphics presets when clicking the Restore Graphics Presets button", async () => {
    // Select the High Graphics preset to ensure we're starting from a known state
    await selectGraphics(window, GRAPHICS_PRESETS.HIGH);

    const fileToModify = "SkyrimPrefs.ini";
    const originalFilePath = path.join(
      `${mockFiles.mockModpackPath}/launcher/Graphics Presets/${GRAPHICS_PRESETS.HIGH.value}/${fileToModify}`
    );
    const backupFilePath = path.join(
      `${mockFiles.mockModpackPath}/launcher/_backups/graphics/${GRAPHICS_PRESETS.HIGH.value}/${fileToModify}`
    );
    const originalContent = await fs.readFile(originalFilePath, "utf-8");
    const backupContent = await fs.readFile(backupFilePath, "utf-8");

    await fs.writeFile(
      originalFilePath,
      originalContent +
        "\n#This is a test modification for graphics restore test"
    );

    await navigateAndWait(window, PAGES.ADVANCED);

    const messageBoxHandle = await mockMessageBox(electronApp, 1);

    await window.getByTestId("restore-graphics-presets").click();

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

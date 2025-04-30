import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  startTestApp,
  waitForModDirectorySelect,
} from "./util/setup";
import type { ElectronApplication } from "playwright";
import { getUserPreferences } from "./util/user-preferences";
import { mockErrorDialog } from "./util/mocks";
import { waitForDialogShown } from "./util/app-state";
import fs from "fs";

test.describe("Mod Selection", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;

  test.describe("Initial Mod Selection", () => {
    test.beforeEach(async () => {
      ({ window, closeTestApp, electronApp, mockFiles } = await startTestApp(
        test
      ));

      await waitForModDirectorySelect(window);
    });

    test.afterEach(async () => {
      await closeTestApp();
    });

    test("should show the initial mod selection screen", async () => {
      const modDirectory = window.getByTestId("mod-directory");

      await expect(modDirectory).toBeVisible();

      // Verify the welcome text is shown
      const welcomeText = await modDirectory
        .getByTestId("input-label")
        .textContent();
      expect(welcomeText).toBe(
        "To get started, select your Wildlander installation directory:"
      );
    });

    test("should select a mod directory from the initial selection", async () => {
      const modDirectorySelectTestId = "mod-directory-select";

      // Get the mod directory path from the first option
      await window.getByTestId(modDirectorySelectTestId).click();
      const firstOption = window
        .getByTestId(modDirectorySelectTestId)
        .getByTestId("dropdown-option-0");

      const modDirectoryPath = await firstOption.textContent();

      // Select the first option
      await firstOption.click();

      // Verify we're redirected to the home page after selection
      await expect(window.getByTestId("page-home")).toBeVisible();

      // Get the user preferences
      const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);

      // Verify the mod directory is set correctly
      expect(userPreferences.MOD_DIRECTORY).toBe(modDirectoryPath);
    });

    test("should show an error when selecting an invalid mod directory", async () => {
      // Attempt to select an invalid mod directory
      const modDirectorySelectTestId = "mod-directory-select";

      // Ensure the dropdown is visible
      await window.getByTestId(modDirectorySelectTestId).waitFor({
        state: "visible",
      });

      // Open the dropdown
      await window.getByTestId(modDirectorySelectTestId).click();

      // Select the option with the text `/invalid/path`
      const invalidOption = window.getByText("/invalid/path");

      const errorDialogHandle = await mockErrorDialog(electronApp);

      await invalidOption.click();

      const { title, content } = await waitForDialogShown(errorDialogHandle);

      expect({ title, content }).toEqual({
        title: "Invalid modpack directory selected",
        content:
          'Please ensure this is a valid modpack installation directory. Remember, this is NOT the Skyrim directory, it is the mod\'s installation directory. Missing files/directories: "ModOrganizer.exe","profiles","launcher"',
      });

      // Assert the mod directory selection is still visible
      await expect(window.getByTestId(modDirectorySelectTestId)).toBeVisible();

      // Verify the user preferences file is still an empty object
      const userPreferencesPath = `${mockFiles.mockFilesPath}/config/userPreferences.json`;
      const fileContents = fs.readFileSync(userPreferencesPath, "utf-8");
      expect(JSON.parse(fileContents)).toEqual({});
    });
  });
});

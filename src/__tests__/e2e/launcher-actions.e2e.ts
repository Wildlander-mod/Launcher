import { expect, test, Page } from "@playwright/test";
import {
  startTestApp,
  setModpackAndWaitForAppLoaded,
  MockFilesPaths,
  CloseTestApp,
} from "./util/setup";
import type { ElectronApplication } from "playwright";
import { PAGES, navigateAndWait } from "./util/navigation";
import { mockElectronShell, mockUserPreferencesStore } from "./util/mocks";
import fs from "fs/promises";
import path from "path";
import { getUserPreferences, setUserPreference } from "./util/user-preferences";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";

test.describe("Launcher actions", () => {
  let electronApp: ElectronApplication;
  let closeTestApp: CloseTestApp;
  let window: Page;
  let mockFiles: MockFilesPaths;

  test.beforeEach(async () => {
    ({ electronApp, closeTestApp, window, mockFiles } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window);
  });

  test.describe("Advanced", () => {
    test.afterEach(async () => {
      await closeTestApp();
    });

    test("should open application logs when clicking the open button", async () => {
      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      const shellHandle = await mockElectronShell(electronApp);

      // Click the open logs button
      await advancedPage
        .getByText("Application logs")
        // Get the container of the open button
        .locator("..")
        .getByText("Open")
        .click();

      const shellDetails = await shellHandle.evaluate((h) => h());

      // Verify shell.openPath was called with the correct path
      expect(path.normalize(shellDetails.pathArgument)).toEqual(
        path.normalize(`${mockFiles.mockFilesPath}/logs`)
      );
    });

    test("should clear application logs when clicking the clear button", async () => {
      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);
      const logsPath = `${mockFiles.mockFilesPath}/logs`;

      const mainLogPath = `${logsPath}/main.log`;
      const rendererLogPath = `${logsPath}/renderer.log`;

      const mainContentBefore = await fs.readFile(mainLogPath, "utf8");
      const rendererContentBefore = await fs.readFile(rendererLogPath, "utf8");
      // Verify files have content
      expect(mainContentBefore.trim().length).toBeGreaterThan(0);
      expect(rendererContentBefore.trim().length).toBeGreaterThan(0);

      await advancedPage
        .getByText("Application logs")
        .locator("..")
        .getByText("Clear")
        .click();

      const mainContentAfter = await fs.readFile(mainLogPath, "utf8");
      const rendererContentAfter = await fs.readFile(rendererLogPath, "utf8");

      // Verify files are now empty
      expect(mainContentAfter.trim().length).toBe(0);
      expect(rendererContentAfter.trim().length).toBe(0);
      if (
        mainContentAfter.trim().length > 0 ||
        rendererContentAfter.trim().length > 0
      ) {
        console.log(
          `mainContentAfter: ${mainContentAfter}\nrendererContentAfter: ${rendererContentAfter}`
        );
      }
    });

    test("should open crash logs when clicking the open button", async () => {
      // Create the crash logs directory so the application does not error
      const crashLogsPath = path.join(
        mockFiles.mockModpackPath,
        "overwrite/NetScriptFramework/Crash"
      );
      await fs.mkdir(crashLogsPath, { recursive: true });

      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      const shellHandle = await mockElectronShell(electronApp);

      await advancedPage
        .getByText("Skyrim crash logs")
        .locator("..")
        .getByText("Open")
        .click();

      const shellDetails = await shellHandle.evaluate((p) => p());

      // Verify shell.openPath was called with the correct path
      expect(path.normalize(shellDetails.pathArgument)).toEqual(
        path.normalize(crashLogsPath)
      );
    });

    test("should call openInEditor when clicking the edit config button", async () => {
      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      // Create a mock for the Store<UserPreferences> object and bind it to ConfigBinding
      const storeHandle = await mockUserPreferencesStore(electronApp);

      await advancedPage
        .getByText("Edit launcher config")
        .locator("..")
        .getByTestId("edit-config-button")
        .click();

      // Verify openInEditor was called
      const storeDetails = await storeHandle.evaluate((h) => h());
      expect(storeDetails.openInEditorCalled).toBe(true);
    });

    test("should update check prerequisites preference when toggle is changed", async () => {
      await setUserPreference(
        mockFiles.mockFilesPath,
        USER_PREFERENCE_KEYS.CHECK_PREREQUISITES,
        true
      );

      const initialPreferences = await getUserPreferences(
        mockFiles.mockFilesPath
      );
      expect(initialPreferences[USER_PREFERENCE_KEYS.CHECK_PREREQUISITES]).toBe(
        true
      );

      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      await advancedPage.getByTestId("check-prerequisites-toggle").click();

      // Get updated user preferences and verify CHECK_PREREQUISITES is now false
      const updatedPreferences = await getUserPreferences(
        mockFiles.mockFilesPath
      );
      expect(updatedPreferences[USER_PREFERENCE_KEYS.CHECK_PREREQUISITES]).toBe(
        false
      );
    });
  });

  test.describe("Application actions", () => {
    test("Minimize the app", async () => {
      const minimizeButton = window.getByTestId("minimize-button");
      await minimizeButton.waitFor({ state: "visible" });

      // Click the minimize button
      await minimizeButton.click();

      // Verify the window is minimized using Electron API
      await new Promise((resolve) => setTimeout(resolve, 500)); // Add a small delay
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const isMinimized = await electronApp.evaluate(({ BrowserWindow }) => {
        const browserWindow = BrowserWindow.getAllWindows()[0];
        if (!browserWindow) {
          throw new Error("No window found");
        }
        return browserWindow.isMinimized();
      });

      expect(isMinimized).toBe(true);

      await closeTestApp();
    });

    test("Close the app", async () => {
      const closeButton = window.getByTestId("close-button");
      await closeButton.waitFor({ state: "visible" });

      // Wait for the "close" event before clicking the close button
      const closeEventPromise = electronApp.waitForEvent("close", {
        timeout: 5000,
      });

      // Click the close button
      await closeButton.click();

      // Wait for the app process to emit the "close" event
      await expect(closeEventPromise).resolves.not.toThrow(); // Verify the app closed successfully
    });
  });
});

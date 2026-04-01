import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  reloadWindow,
  setModpackAndWaitForAppLoaded,
  startTestApp,
} from "./util/setup";
import { getUserPreferences, setUserPreference } from "./util/user-preferences";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { PROFILES, selectProfile } from "./util/profile";
import { mockErrorDialog, mockMessageBox } from "./util/mocks";
import type { ElectronApplication } from "playwright";
import fs from "fs/promises";
import path from "path";
import {
  waitForClickEventsEnabled,
  waitForDialogShown,
  waitForMessageBoxShown,
} from "./util/app-state";
import { PAGES, navigateAndWait } from "./util/navigation";

test.describe("Profiles", () => {
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

  test("should display the profile selection dropdown", async () => {
    const profileDropdown = window.getByTestId("profile-dropdown");
    await expect(profileDropdown).toBeVisible();
  });

  test.describe("Profile selection", () => {
    const profiles = [
      { profile: PROFILES.STANDARD, label: PROFILES.STANDARD.text },
      { profile: PROFILES.PERFORMANCE, label: PROFILES.PERFORMANCE.text },
    ];

    for (const { profile, label } of profiles) {
      test(`should update user preferences when selecting ${label} profile`, async () => {
        const selectedProfileValue = await selectProfile(window, profile);

        const userPreferences = await getUserPreferences(
          mockFiles.mockFilesPath
        );
        const profilePreference = userPreferences[USER_PREFERENCE_KEYS.PRESET];

        expect(profilePreference).toBe(selectedProfileValue);
      });
    }
  });

  test.describe("Hidden profiles", () => {
    const hiddenProfiles = Object.values(PROFILES).filter(
      (profile) => profile.hidden
    );

    test("should not display hidden profiles by default", async () => {
      const profileDropdown = window.getByTestId("profile-dropdown");
      await profileDropdown.getByTestId("dropdown-head").click();

      const optionsContainer = profileDropdown.getByTestId("dropdown-options");

      // Check that hidden profiles are not visible
      for (const profile of hiddenProfiles) {
        await expect(
          optionsContainer.getByText(profile.text, { exact: true })
        ).not.toBeVisible();
      }
    });

    test("should display hidden profiles when user preference is set", async () => {
      // Set the user preference to show hidden profiles
      await setUserPreference(
        mockFiles.mockFilesPath,
        USER_PREFERENCE_KEYS.SHOW_HIDDEN_PROFILE,
        true
      );

      // Reload the page to apply the preference
      await reloadWindow(window);

      const profileDropdown = window.getByTestId("profile-dropdown");
      await profileDropdown.getByTestId("dropdown-head").click();

      await profileDropdown.click();

      const optionsContainer = profileDropdown.getByTestId("dropdown-options");

      // Check that hidden profiles are now visible
      for (const profile of hiddenProfiles) {
        await expect(
          optionsContainer.getByText(profile.text, { exact: true })
        ).toBeVisible();
      }
    });

    test("should update user preferences when selecting a hidden profile", async () => {
      // Set the user preference to show hidden profiles
      await setUserPreference(
        mockFiles.mockFilesPath,
        USER_PREFERENCE_KEYS.SHOW_HIDDEN_PROFILE,
        true
      );

      // Reload the page to apply the preference
      await reloadWindow(window);

      const selectedProfileValue = await selectProfile(window, PROFILES.ULTRA);

      const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);
      const profilePreference = userPreferences[USER_PREFERENCE_KEYS.PRESET];

      expect(profilePreference).toBe(selectedProfileValue);
    });

    test("should show hidden profiles when toggling the switch on Advanced page", async () => {
      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      await advancedPage.getByTestId("show-hidden-profiles-toggle").click();

      // Verify that the user preference has been updated
      const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);
      expect(userPreferences[USER_PREFERENCE_KEYS.SHOW_HIDDEN_PROFILE]).toBe(
        true
      );

      const profileDropdown = window.getByTestId("profile-dropdown");
      await profileDropdown.getByTestId("dropdown-head").click();

      const optionsContainer = profileDropdown.getByTestId("dropdown-options");

      // Check that hidden profiles are now visible
      for (const profile of hiddenProfiles) {
        await expect(
          optionsContainer.getByText(profile.text, { exact: true })
        ).toBeVisible();
      }
    });
  });

  test.describe("Restore profiles ", () => {
    test("should not restore MO2 profiles when cancelling the confirmation dialog", async () => {
      const profileToTest = PROFILES.PERFORMANCE;
      const fileToModify = "plugins.txt";
      const primaryFilePath = path.join(
        `${mockFiles.mockModpackPath}/profiles/${profileToTest.value}/${fileToModify}`
      );

      await navigateAndWait(window, PAGES.ADVANCED);

      await selectProfile(window, PROFILES.PERFORMANCE);

      const originalContent = await fs.readFile(primaryFilePath, "utf-8");
      const modifiedContent =
        originalContent +
        "\n# This is a test modification for cancel MO2 profile restore test";
      await fs.writeFile(primaryFilePath, modifiedContent);

      const messageBoxHandle = await mockMessageBox(electronApp, 0);

      await window.getByTestId("restore-mo2-profiles").click();

      await waitForMessageBoxShown(messageBoxHandle);
      await waitForClickEventsEnabled(window);

      const contentAfterCancel = await fs.readFile(primaryFilePath, "utf-8");

      // Verify the file was not restored after cancelling
      expect(contentAfterCancel).toBe(modifiedContent);
    });

    test("should show error dialog when restoring MO2 profiles fails", async () => {
      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      const errorDialogHandle = await mockErrorDialog(electronApp);
      await mockMessageBox(electronApp, 1);

      // Delete the backup directory to cause the restore to fail
      const backupProfilesDir = `${mockFiles.mockModpackPath}/launcher/_backups/profiles`;
      await fs.rm(backupProfilesDir, { recursive: true });

      await advancedPage.getByTestId("restore-mo2-profiles").click();

      await waitForClickEventsEnabled(window);

      const errorDetails = await waitForDialogShown(errorDialogHandle);

      expect(errorDetails.dialogShown).toBe(true);
      expect(errorDetails.title).toBe("Error restoring MO2 profiles");
      expect(errorDetails.content).toContain("no such file or directory");
    });

    test("should restore MO2 profiles when clicking the Restore MO2 Profiles button", async () => {
      const profileToTest = PROFILES.PERFORMANCE;
      const fileToModify = "plugins.txt";
      const primaryFilePath = path.join(
        `${mockFiles.mockModpackPath}/profiles/${profileToTest.value}/${fileToModify}`
      );
      const backupFilePath = path.join(
        `${mockFiles.mockModpackPath}/launcher/_backups/profiles/${profileToTest.value}/${fileToModify}`
      );

      await navigateAndWait(window, PAGES.ADVANCED);

      await selectProfile(window, PROFILES.PERFORMANCE);

      const originalPrimaryContent = await fs.readFile(
        primaryFilePath,
        "utf-8"
      );
      const backupContent = await fs.readFile(backupFilePath, "utf-8");

      await fs.writeFile(
        primaryFilePath,
        originalPrimaryContent +
          "\n# This is a test modification for MO2 profile restore test"
      );

      const messageBoxHandle = await mockMessageBox(electronApp, 1);

      await window.getByTestId("restore-mo2-profiles").click();

      await waitForMessageBoxShown(messageBoxHandle);
      await waitForClickEventsEnabled(window);

      const restoredContent = await fs.readFile(primaryFilePath, "utf-8");
      const currentBackupContent = await fs.readFile(backupFilePath, "utf-8");

      // Verify the content of the restored file matches the backup file
      expect(restoredContent).toBe(currentBackupContent);
      // Verify the backup file was not modified during the restore process
      expect(currentBackupContent).toBe(backupContent);
    });
  });
});

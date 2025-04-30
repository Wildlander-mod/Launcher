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

test.describe("Profile Selection", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;

  test.beforeEach(async () => {
    ({ window, closeTestApp, mockFiles } = await startTestApp(test));
    await setModpackAndWaitForAppLoaded(window, mockFiles);
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should display the profile selection dropdown", async () => {
    const profileDropdown = window.getByTestId("profile-dropdown");
    await expect(profileDropdown).toBeVisible();
  });

  test.describe("profile selection updates preferences", () => {
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

  test.describe("hidden profiles", () => {
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
  });
});

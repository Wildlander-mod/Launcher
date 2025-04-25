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
import {
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
} from "./util/app-state";

/**
 * Unified profile configuration object that combines all profile information
 * - id: Unique identifier for the profile (used in tests)
 * - value: The actual profile name used in the system
 * - text: The display text shown to the user
 * - hidden: Whether the profile is hidden by default
 */
const PROFILES = {
  // Standard profiles
  STANDARD: {
    id: "STANDARD",
    value: "0_Wildlander-STANDARD",
    text: "Standard Modlist",
    hidden: false,
  },
  PERFORMANCE: {
    id: "PERFORMANCE",
    value: "0_Wildlander-PERFORMANCE",
    text: "Performance Modlist",
    hidden: false,
  },

  // Hidden profiles
  ULTRA: {
    id: "ULTRA",
    value: "1_Wildlander-ULTRA",
    text: "Ultra Graphics",
    hidden: true,
  },
  HIGH: {
    id: "HIGH",
    value: "1_Wildlander-HIGH",
    text: "High Graphics",
    hidden: true,
  },
  MEDIUM: {
    id: "MEDIUM",
    value: "1_Wildlander-MEDIUM",
    text: "Medium Graphics",
    hidden: true,
  },
  LOW: {
    id: "LOW",
    value: "1_Wildlander-LOW",
    text: "Low Graphics",
    hidden: true,
  },
  POTATO: {
    id: "POTATO",
    value: "1_Wildlander-POTATO",
    text: "Potato Graphics",
    hidden: true,
  },
};

/**
 * Helper function to select a profile from the dropdown
 * @param window The Playwright Page object
 * @param profile The profile object to select
 * @returns The selected profile value
 */
const selectProfile = async (
  window: Page,
  profile: (typeof PROFILES)[keyof typeof PROFILES]
) => {
  const profileDropdown = window.getByTestId("profile-dropdown");
  await profileDropdown.getByTestId("dropdown-head").click();

  // Get the promise for waiting for the button to be disabled before clicking
  // This ensures we capture the disabled state even if it happens very quickly
  const disabledPromise = waitForLaunchButtonDisabled(window);

  const optionsContainer = profileDropdown.getByTestId("dropdown-options");
  await optionsContainer.getByText(profile.text).click();

  // Now await the promise to ensure the button was disabled at least once after the click
  await disabledPromise;

  // Wait for the profile change to complete (button enabled again)
  await waitForLaunchButtonEnabled(window);

  return profile.value;
};

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

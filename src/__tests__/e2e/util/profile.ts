import type { Page } from "@playwright/test";
import {
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
} from "./app-state";

/**
 * Unified profile configuration object that combines all profile information
 * - id: Unique identifier for the profile (used in tests)
 * - value: The actual profile name used in the system
 * - text: The display text shown to the user
 * - hidden: Whether the profile is hidden by default
 */
export const PROFILES = {
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

  // Hidden profiles (only available in profile-selection.e2e.ts tests)
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
export const selectProfile = async (
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

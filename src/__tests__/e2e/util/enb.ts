import { Page } from "@playwright/test";
import {
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
} from "./app-state";

/**
 * Hardcoded ENB presets configuration based on the mock namesENB.json file
 * - value: The actual preset name used in the system
 * - text: The display text shown to the user
 */
export const ENB_PRESETS = {
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
export const selectEnb = async (
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

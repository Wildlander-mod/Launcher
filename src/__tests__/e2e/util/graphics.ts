import { Page } from "@playwright/test";
import {
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
} from "./app-state";

/**
 * Hardcoded graphics presets configuration
 * - value: The actual preset name used in the system
 * - text: The display text shown to the user
 */
export const GRAPHICS_PRESETS = {
  ULTRA: {
    value: "1_Wildlander-ULTRA",
    text: "Ultra Graphics",
  },
  HIGH: {
    value: "1_Wildlander-HIGH",
    text: "High Graphics",
  },
  MEDIUM: {
    value: "1_Wildlander-MEDIUM",
    text: "Medium Graphics",
  },
  LOW: {
    value: "1_Wildlander-LOW",
    text: "Low Graphics",
  },
  POTATO: {
    value: "1_Wildlander-POTATO",
    text: "Potato Graphics",
  },
};

/**
 * Helper function to select a graphics preset from the dropdown
 * @param window The Playwright Page object
 * @param preset The graphics preset object to select
 * @returns The selected graphics preset value (used for verification in tests)
 */
export const selectGraphics = async (
  window: Page,
  preset: (typeof GRAPHICS_PRESETS)[keyof typeof GRAPHICS_PRESETS]
) => {
  const graphicsDropdown = window.getByTestId("graphics-dropdown");
  await graphicsDropdown.getByTestId("dropdown-head").click();

  // Get the promise for waiting for the button to be disabled before clicking
  // This ensures we capture the disabled state even if it happens very quickly
  const disabledPromise = waitForLaunchButtonDisabled(window);

  // Select the graphics preset
  const optionsContainer = graphicsDropdown.getByTestId("dropdown-options");
  await optionsContainer.getByText(preset.text).click();

  // Now await the promise to ensure the button was disabled at least once after the click
  await disabledPromise;

  // Wait for the graphics change to complete (button enabled again)
  await waitForLaunchButtonEnabled(window);

  return preset.value;
};

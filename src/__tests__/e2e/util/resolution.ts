import { Page } from "@playwright/test";
import type { Resolution } from "../../../shared/types/Resolution";
import {
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
} from "./app-state";

/**
 * Helper function to select a resolution from the dropdown
 * @param window The Playwright Page object
 * @param resolution The resolution object with width and height properties
 * @returns The same resolution object (used for verification in some tests)
 */
export const selectResolution = async (
  window: Page,
  resolution: Resolution
) => {
  const resolutionDropdown = window.getByTestId("resolution-dropdown");
  await resolutionDropdown.getByTestId("dropdown-head").click();

  const { width, height } = resolution;
  const targetResolutionText = `${width} x ${height}`;

  // Get the promise for waiting for the button to be disabled before clicking
  // This ensures we capture the disabled state even if it happens very quickly
  const disabledPromise = waitForLaunchButtonDisabled(window);

  // Select the resolution
  await resolutionDropdown.getByText(targetResolutionText).click();

  // Now await the promise to ensure the button was disabled at least once after the click
  await disabledPromise;

  // Wait for the resolution change to complete (button enabled again)
  await waitForLaunchButtonEnabled(window);

  return resolution;
};

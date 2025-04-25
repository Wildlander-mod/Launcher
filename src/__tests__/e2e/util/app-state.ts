import { Page } from "@playwright/test";
import { waitForClass } from "./element";

/**
 * Waits for the game running modal to appear.
 * @param window The Playwright Page object
 * @returns Promise that resolves when the game running modal appears
 */
export const gameLaunched = async (window: Page) => {
  return window
    .getByTestId("game-running-modal")
    .waitFor({ state: "attached" });
};

/**
 * Waits for the game running modal to disappear.
 * @param window The Playwright Page object
 * @returns Promise that resolves when the game running modal disappears
 */
export const gameExited = async (window: Page) => {
  return window.getByTestId("game-running-modal").waitFor({ state: "hidden" });
};

/**
 * Helper function to wait for the launch button to be disabled.
 * @param window The Playwright Page object
 * @returns Promise that resolves when the launch button is disabled
 */

export const waitForLaunchButtonDisabled = async (window: Page) => {
  return waitForClass(window, {
    testId: "launch-game",
    className: "c-button--disabled",
    shouldExist: true,
  });
};

/**
 * Helper function to wait for the launch button to be enabled.
 * @param window The Playwright Page object
 * @returns Promise that resolves when the launch button is enabled
 */
export const waitForLaunchButtonEnabled = async (window: Page) => {
  return waitForClass(window, {
    testId: "launch-game",
    className: "c-button--disabled",
    shouldExist: false,
  });
};

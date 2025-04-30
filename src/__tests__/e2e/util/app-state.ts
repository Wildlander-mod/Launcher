import { Page } from "@playwright/test";
import { waitForClass } from "./element";
import type { JSHandle } from "playwright";

interface DialogDetails {
  title: string;
  content: string;
  dialogShown: boolean;
}

interface MessageBoxDetails {
  messageBoxShown: boolean;
  messageBoxTitle: string;
  messageBoxMessage: string;
}

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

/**
 * Waits for click events to be disabled (u-disable-click-events class added)
 * Useful to know if application-wide click events are disabled
 * @param window The Playwright Page object
 * @returns Promise that resolves when click events are disabled
 */
export const waitForClickEventsDisabled = async (
  window: Page
): Promise<void> => {
  return waitForClass(window, {
    testId: "app-page",
    className: "u-disable-click-events",
    shouldExist: true,
  });
};

/**
 * Waits for click events to be enabled (u-disable-click-events class removed)
 * Useful to know if application-wide click events are enabled
 * @param window The Playwright Page object
 * @returns Promise that resolves when click events are enabled
 */
export const waitForClickEventsEnabled = async (
  window: Page
): Promise<void> => {
  return waitForClass(window, {
    testId: "app-page",
    className: "u-disable-click-events",
    shouldExist: false,
  });
};

/**
 * Waits for a dialog to be shown and returns its details
 * @param handle - The JSHandle returned by the mockErrorDialog function
 * @returns A promise that resolves with the dialog details when the dialog is shown
 */
export const waitForDialogShown = async (
  handle: JSHandle<() => DialogDetails>
): Promise<DialogDetails> => {
  return handle.evaluate(async (fn) => {
    while (!fn().dialogShown) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return fn();
  });
};

/**
 * Waits for a message box to be shown and returns its details
 * @param handle - The JSHandle returned by the mockMessageBox function
 * @returns A promise that resolves with the message box details when the message box is shown
 */
export const waitForMessageBoxShown = async (
  handle: JSHandle<() => MessageBoxDetails>
): Promise<MessageBoxDetails> => {
  return handle.evaluate(async (fn) => {
    while (!fn().messageBoxShown) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return fn();
  });
};

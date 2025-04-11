import { Page } from "@playwright/test";

/**
 * Helper function to wait for an element to have or not have a specific class.
 * @param window The Playwright Page object
 * @param options Object containing the following properties:
 * @param options.testId The testid of the element to check
 * @param options.className The class name to check for
 * @param options.shouldExist Whether to wait for the class to exist (true) or not exist (false)
 * @returns Promise that resolves when the condition is met
 */
export const waitForClass = async (
  window: Page,
  options: { testId: string; className: string; shouldExist: boolean }
) => {
  const { testId, className, shouldExist } = options;
  return window.waitForFunction(
    ([i, c, exists]) =>
      !!document.querySelector(`[data-testid="${i}"]`).classList.contains(c) ===
      exists,
    [testId, className, shouldExist],
    { timeout: 5000 }
  );
};

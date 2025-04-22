import { Page } from "@playwright/test";

type ClassOptions = {
  /** The testid of the element to check */
  testId: string;
  /** The class name to check for */
  className: string;
  /** Whether to check if the class exists (true) or not exists (false) */
  shouldExist: boolean;
};

/**
 * Helper function to check if an element has or doesn't have a specific class.
 * @param window The Playwright Page object
 * @param options The options for checking class existence
 * @returns Promise that resolves to true if the condition is met, false otherwise
 */
export const classExists = async (
  window: Page,
  { testId, className, shouldExist }: ClassOptions
): Promise<boolean> => {
  const element = window.getByTestId(testId);
  const classes = (await element.getAttribute("class"))?.split(" ") ?? [];
  return classes.includes(className) === shouldExist;
};

/**
 * Helper function to wait for an element to have or not have a specific class.
 * Uses MutationObserver to watch for class changes, which is more reliable than polling.
 * @param window The Playwright Page object
 * @param options The options for waiting on class changes
 * @returns Promise that resolves when the condition is met
 */
export const waitForClass = async (window: Page, options: ClassOptions) => {
  const { testId, className, shouldExist } = options;

  if (await classExists(window, options)) {
    return;
  }

  // If the class does not exist, wait for it to be added or removed
  return window.evaluate(
    ([i, c, exists]: [string, string, boolean]) => {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(`[data-testid="${i}"]`);

        const observer = new MutationObserver((mutations) => {
          // Check if the expected condition is met
          if (!!element.classList.contains(c) === exists) {
            observer.disconnect();
            resolve(true);
          }
        });

        // Start observing the element for class changes
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["class"],
        });

        // Set a timeout to avoid hanging indefinitely if the mutation never occurs
        setTimeout(() => {
          observer.disconnect();
          const currentClasses = Array.from(element.classList).join(", ");
          const action = exists ? "be added to" : "be removed from";
          reject(
            new Error(
              `Timed out waiting for class "${c}" to ${action} element with testId "${i}". Current classes: ${currentClasses}`
            )
          );
        }, 5000);
      });
    },
    [testId, className, shouldExist]
  );
};

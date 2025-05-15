import { Locator, Page } from "@playwright/test";

/**
 * Enum representing the application pages
 */
export enum PAGES {
  HOME = "Home",
  COMMUNITY = "Community",
  ADVANCED = "Advanced",
}

/**
 * Navigates to the specified page and waits for it to be visible
 * @param window The Playwright page object
 * @param page The page to navigate to (from PAGES enum)
 * @returns The page's locator
 */
export const navigateAndWait = async (
  window: Page,
  page: PAGES
): Promise<Locator> => {
  await window.getByTestId("navigation-container").getByText(page).click();
  const pageTestId = `page-${page.toLowerCase()}`;
  await window.getByTestId(pageTestId).waitFor({ state: "visible" });

  return window.getByTestId(pageTestId);
};

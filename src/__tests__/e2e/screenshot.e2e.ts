import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  setModpackAndWaitForAppLoaded,
  startTestApp,
} from "./util/setup";
import { navigateAndWait, PAGES } from "./util/navigation";
import {
  addPatronsToLocalStorage,
  mockPatreonEndpoint,
  mockPatrons,
} from "./util/patreon";

/**
 * Note: for these tests to run consistently, they must be run within the same environment.
 * There are Dockerfile and docker-compose.yaml files provided to run these in a consistent environment.
 */
test.describe("UI Visual Regression", { tag: "@screenshot" }, () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should match the visual snapshot after modpack selection", async () => {
    ({ window, closeTestApp, mockFiles } = await startTestApp(
      test,
      "modpack-path-home"
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);

    await mockPatreonEndpoint(window);

    // Add patrons to localStorage so that the Patrons aren't shuffled
    await addPatronsToLocalStorage(window, mockPatrons);

    // Reload the page to ensure the mocked values are used
    await window.reload();

    await window.getByTestId("patrons-container").waitFor({ state: "visible" });
    await window.getByTestId("news-container").waitFor({ state: "visible" });

    await expect(window).toHaveScreenshot("initial-modpack-loaded-page.png");
  });

  test("should match the visual snapshot of the Community page", async () => {
    ({ window, closeTestApp, mockFiles } = await startTestApp(
      test,
      "modpack-path-community"
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);

    await navigateAndWait(window, PAGES.COMMUNITY);
    await expect(window).toHaveScreenshot("community-page.png");
  });

  test("should match the visual snapshot of the Advanced page", async () => {
    ({ window, closeTestApp, mockFiles } = await startTestApp(
      test,
      "modpack-path-advanced"
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);

    await navigateAndWait(window, PAGES.ADVANCED);
    await expect(window).toHaveScreenshot("advanced-page.png");
  });
});

import { Page, test, expect } from "@playwright/test";
import {
  startTestApp,
  setModpackAndWaitForAppLoaded,
  CloseTestApp,
} from "./util/setup";
import { PAGES, navigateAndWait } from "./util/navigation";

test.describe("Community", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;

  // Define test data for better organization and maintainability
  const links = [
    {
      name: "YouTube",
      url: "https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww",
    },
    { name: "Twitch", url: "https://www.twitch.tv/dylanbperry" },
    { name: "Discord", url: "https://discord.gg/8VkDrfq" },
    { name: "Reddit", url: "https://reddit.com/r/wildlander" },
  ];

  test.beforeEach(async () => {
    ({ window, closeTestApp } = await startTestApp(test));
    await setModpackAndWaitForAppLoaded(window);

    // Navigate to the Community page
    await navigateAndWait(window, PAGES.COMMUNITY);
  });
  test.afterEach(async () => {
    await closeTestApp();
  });

  // Test each link to ensure it has the correct URL
  for (const { name, url } of links) {
    test(`${name} link should have the correct URL`, async () => {
      // Find the link by its text content
      const link = window.locator(`text=${name}`).first();

      // Wait for the link to be visible
      await link.waitFor({ state: "visible" });

      // Get the parent BaseLink element which has the href attribute
      const baseLink = link.locator("xpath=ancestor::a");

      // Verify the href attribute
      await expect(baseLink).toHaveAttribute("href", url);
    });
  }
});

import { expect, test, Page } from "@playwright/test";
import { startTestApp, CloseTestApp } from "./util/setup";
import type { ElectronApplication } from "playwright";
import { sendIpcToRenderer } from "./util/mocks";

test.describe("Auto update", () => {
  let electronApp: ElectronApplication;
  let closeTestApp: CloseTestApp;
  let window: Page;

  test.beforeEach(async () => {
    ({ electronApp, closeTestApp, window } = await startTestApp(test));
    await window.evaluate((hash) => {
      location.hash = hash;
    }, "/auto-update");
    await window
      .getByTestId("auto-update-loading")
      .waitFor({ state: "visible" });
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should show loading state initially", async () => {
    await expect(window.getByTestId("auto-update-loading")).toBeVisible();
    await expect(window.getByTestId("auto-update-content")).not.toBeVisible();
  });

  test("should transition to update-available content when update-available event is received", async () => {
    await sendIpcToRenderer(electronApp, "update-available");

    await expect(window.getByTestId("auto-update-content")).toBeVisible();
    await expect(window.getByTestId("auto-update-loading")).not.toBeVisible();
  });

  test("should update download percentage when download-progress event is received", async () => {
    await sendIpcToRenderer(electronApp, "download-progress", 42);

    await expect(window.getByTestId("auto-update-progress")).toContainText(
      "42%"
    );
  });
});

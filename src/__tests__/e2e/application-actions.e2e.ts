import { expect, test, Page } from "@playwright/test";
import {
  startTestApp,
  setModpackAndWaitForAppLoaded,
  MockFilesPaths,
  CloseTestApp,
} from "./util/setup";
import type { ElectronApplication } from "playwright";

test.describe("Application Actions", () => {
  let electronApp: ElectronApplication;
  let closeTestApp: CloseTestApp;
  let window: Page;
  let mockFiles: MockFilesPaths;

  test.beforeEach(async () => {
    ({ electronApp, closeTestApp, window, mockFiles } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);
  });

  test("Minimize the app", async () => {
    const minimizeButton = window.getByTestId("minimize-button");
    await minimizeButton.waitFor({ state: "visible" });

    // Click the minimize button
    await minimizeButton.click();

    // Verify the window is minimized using Electron API
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await new Promise((resolve) => setTimeout(resolve, 500)); // Add a small delay
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const isMinimized = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows()[0].isMinimized();
    });

    expect(isMinimized).toBe(true);

    await closeTestApp();
  });

  test("Close the app", async () => {
    const closeButton = window.getByTestId("close-button");
    await closeButton.waitFor({ state: "visible" });

    // Wait for the "close" event before clicking the close button
    const closeEventPromise = electronApp.waitForEvent("close", {
      timeout: 5000,
    });

    // Click the close button
    await closeButton.click();

    // Wait for the app process to emit the "close" event
    await expect(closeEventPromise).resolves.not.toThrow(); // Verify the app closed successfully
  });
});

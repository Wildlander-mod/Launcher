import {
  createDirectoryStructure,
  getMockAPPDATALocal,
  mockModpack,
} from "./generate-modpack-files";
import { config } from "./config";
import fs from "fs/promises";
import {
  _electron as electron,
  expect,
  Page,
  test as Test,
} from "@playwright/test";
import type { ElectronApplication } from "playwright";
import { randomBytes } from "crypto";
import path from "path";

export type CloseTestApp = () => Promise<void>;

const UUID = (): string => {
  return randomBytes(16).toString("hex");
};

export interface MockFilesPaths {
  // The full path to the mock files inside the playwright directory
  mockFilesPath: string;
  // The path to the mock modpack directory "/{mockFilesPath}/mock-modpack-install"
  mockModpackPath: string;
  // The path to a mock %APP_DATA% that will be set on the Electron instance "/${mockFilesPath}/local"
  mockAppDataLocalPath: string;
}

/**
 * Create mock files for the launcher to use.
 * - userPreferences.json
 * - wabbajack install settings
 * - mock modpack install
 */
export const createMockFiles = async (
  test: typeof Test,
  modpackPath?: string
): Promise<MockFilesPaths> => {
  // Create an area for the Electron app to store config/files.
  const mockFilesPath = path.join(
    config().paths.mockFiles,
    test.info().titlePath[1] as string,
    modpackPath ?? UUID()
  );
  await fs.mkdir(mockFilesPath, { recursive: true });
  const mockModpackPath = `${mockFilesPath}/mock-modpack-install`;
  const mockAppDataLocalPath = `${mockFilesPath}/local`;

  createDirectoryStructure(mockModpack, mockModpackPath);
  createDirectoryStructure(
    getMockAPPDATALocal(mockModpackPath),
    mockAppDataLocalPath
  );

  return {
    mockFilesPath,
    mockModpackPath,
    mockAppDataLocalPath,
  };
};

export const startTestApp = async (
  test: typeof Test,
  modpackPath?: string
): Promise<{
  mockFiles: MockFilesPaths;
  window: Page;
  electronApp: ElectronApplication;
  closeTestApp: CloseTestApp;
}> => {
  const { mockFilesPath, mockModpackPath, mockAppDataLocalPath } =
    await createMockFiles(test, modpackPath);

  // Launch Electron app.
  const electronApp = await electron.launch({
    executablePath: config().paths.executablePath,
    env: {
      ...process.env,
      CONFIG_PATH: `${mockFilesPath}/config`,
      APPDATA: `${mockFilesPath}/APPDATA`,
      MULTIPLE_INSTANCE: "true",
      // Disable this to open dev tools by default
      IS_TEST: "true",
      LOG_PATH: `${mockFilesPath}/logs`,
      IS_E2E: "true",
    },
    // recordVideo: { dir: "test-results" },
  });

  // Attach the electron logs to the current process.
  if (process.env["DEBUG"]) {
    electronApp.on("console", console.log);
  }

  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow();

  if (process.env["DEBUG"]) {
    // Direct Electron Renderer console to Node terminal.
    window.on("console", console.log);
  }

  // Move the window slightly in a random direction by 200 pixels for e2e tests,
  // but only if playwrights is using more than one worker
  // this allows all windows to be visible when using multiple workers
  if (!process.env["CI"]) {
    // CI uses 2 workers, local uses 3 workers by default
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await electronApp.evaluate(({ BrowserWindow }) => {
      const offset = 200;
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        const [x, y] = win.getPosition() as [number, number];
        // Generate random direction: up, down, left, right, or diagonal
        const randomX = Math.random() > 0.5 ? offset : -offset;
        const randomY = Math.random() > 0.5 ? offset : -offset;
        win.setPosition(x + randomX, y + randomY);
      }
    });
  }

  const closeTestApp = async () => {
    await electronApp.close();
  };

  return {
    mockFiles: {
      mockFilesPath,
      mockModpackPath,
      mockAppDataLocalPath,
    },
    window,
    electronApp,
    closeTestApp,
  };
};

export const screenshot = async (
  window: Page,
  test: typeof Test,
  name: string
) => {
  return window.screenshot({
    path: `${config().paths.screenshots}/${test.name}/${name}.png`,
    fullPage: true,
  });
};

export const waitForAppLoaded = async (window: Page): Promise<void> => {
  await window.getByTestId("launch-game").waitFor({ state: "visible" });
};

/**
 * Sets the modpack directory in user preferences and waits for the app to load
 * This is useful for tests that need to set the modpack directory before loading the app
 *
 * @param window The Playwright page object
 */
export const setModpackAndWaitForAppLoaded = async (
  window: Page
): Promise<void> => {
  await selectFirstModpack(window);
};

/**
 * Waits for the mod directory selection to be available
 * This is used for tests that need to interact with the mod directory selection screen
 *
 * @param window The Playwright page object
 */
export const waitForModDirectorySelect = async (
  window: Page
): Promise<void> => {
  await window.getByTestId("mod-directory-select").waitFor({
    state: "visible",
  });
};

/**
 * Selects the first modpack option from the dropdown and returns its path
 *
 * @param window The Playwright page object
 * @returns The path of the selected modpack
 */
export const selectFirstModpack = async (window: Page): Promise<string> => {
  const modDirectorySelectTestId = "mod-directory-select";

  // Open the dropdown
  await window.getByTestId(modDirectorySelectTestId).click();

  // Get the first option
  const firstOption = window
    .getByTestId(modDirectorySelectTestId)
    .getByTestId("dropdown-option-0");

  // Get the mod directory path from the first option
  const modDirectoryPath = await firstOption.textContent();

  if (!modDirectoryPath) {
    throw new Error("Mod directory path not found");
  }

  // Select the first option
  await firstOption.click();

  await expect(window.getByTestId("page-home")).toBeVisible();

  return modDirectoryPath;
};

/**
 * Waits for the preload to complete by checking if the current URL is the auto-update URL.
 * If it is, waits until it changes before proceeding.
 *
 * This method is useful to ensure it's safe to reload the page, as reloading while
 * the URL is the update URL can cause issues with the application loading process.
 *
 * @param window The Playwright page object
 */
export const waitForPreloadComplete = async (window: Page): Promise<void> => {
  const autoUpdateUrl = "auto-update";
  if (window.url().toString().includes(autoUpdateUrl)) {
    await window.waitForURL((url) => !url.toString().includes(autoUpdateUrl));
  }

  // Wait until the page is ready before continuing
  await window.waitForLoadState("load");
};

/**
 * Reloads the window and waits for the app to be loaded.
 * This is useful for tests that need to reload the page after changing settings.
 *
 * @param window The Playwright page object
 */
export const reloadWindow = async (window: Page): Promise<void> => {
  // Wait for preload to complete before reloading
  await waitForPreloadComplete(window);

  // Reload the window
  await window.reload();

  // Wait for the app to be loaded
  await waitForAppLoaded(window);
};

import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  MockFilesPaths,
  setModpackAndWaitForAppLoaded,
  startTestApp,
  waitForLaunchButtonDisabled,
  waitForLaunchButtonEnabled,
} from "./util/setup";
import { getUserPreferences } from "./util/user-preferences";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import type { Resolution } from "../../shared/types/Resolution";
import type { ElectronApplication } from "playwright";
import {
  isModEnabled,
  isPluginEnabled,
  getDisplayTweaksIni,
} from "./util/modlist";

/**
 * Helper function to mock the screen resolution
 * @param electronApp The Electron application instance
 * @param resolution The resolution object with width and height properties
 */
const mockScreenResolution = async (
  electronApp: ElectronApplication,
  resolution: Resolution
) => {
  // Mock the screen.getPrimaryDisplay method to return the specified resolution
  await electronApp.evaluate(({ screen }, { width, height }) => {
    const originalGetPrimaryDisplay = screen.getPrimaryDisplay;

    // Override the getPrimaryDisplay method
    screen.getPrimaryDisplay = () => {
      // Create a mock display with the specified resolution
      return {
        ...originalGetPrimaryDisplay(),
        size: {
          width,
          height,
        },
        scaleFactor: 1,
      };
    };
  }, resolution);
};

/**
 * Helper function to select a resolution from the dropdown
 * @param window The Playwright Page object
 * @param resolution The resolution object with width and height properties
 * @returns The same resolution object (used for verification in some tests)
 */
const selectResolution = async (window: Page, resolution: Resolution) => {
  const resolutionDropdown = window.getByTestId("resolution-dropdown");
  await resolutionDropdown.getByTestId("dropdown-head").click();

  const { width, height } = resolution;
  const targetResolutionText = `${width} x ${height}`;

  // Get the promise for waiting for the button to be disabled before clicking
  // This ensures we capture the disabled state even if it happens very quickly
  const disabledPromise = waitForLaunchButtonDisabled(window);

  // Select the resolution
  await resolutionDropdown.getByText(targetResolutionText).click();

  // Now await the promise to ensure the button was disabled at least once after the click
  await disabledPromise;

  // Wait for the resolution change to complete (button enabled again)
  await waitForLaunchButtonEnabled(window);

  return resolution;
};

test.describe("Resolution", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    ({ window, closeTestApp, mockFiles, electronApp } = await startTestApp(
      test
    ));
    await setModpackAndWaitForAppLoaded(window, mockFiles);
  });

  test.afterEach(async () => {
    await closeTestApp();
  });

  test("should display the resolution dropdown", async () => {
    // Verify the resolution dropdown is visible
    const resolutionDropdown = window.getByTestId("resolution-dropdown");
    await expect(resolutionDropdown).toBeVisible();
  });

  test("should update user preferences when changing resolution", async () => {
    const targetResolution = await selectResolution(window, {
      width: 7680,
      height: 4320,
    });

    // Verify the resolution is updated in user preferences
    const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);
    const resolution = userPreferences[
      USER_PREFERENCE_KEYS.RESOLUTION
    ] as Resolution;
    expect(resolution).toEqual(targetResolution);
  });

  test("should update SSEDisplayTweaks when changing resolution", async () => {
    const targetResolution = await selectResolution(window, {
      width: 3840,
      height: 1080,
    });

    // Verify the resolution is updated in the SSEDisplayTweaks.ini file
    const displayTweaksIni = await getDisplayTweaksIni(mockFiles);
    expect(displayTweaksIni.Render.Resolution).toBe(
      `${targetResolution.width}x${targetResolution.height}`
    );
  });

  test("should enable BorderlessUpscale when non-ultrawide monitor selects non-ultrawide resolution", async () => {
    // Mock a non-ultrawide screen resolution
    await mockScreenResolution(electronApp, { width: 1920, height: 1080 });

    // Select a non-ultrawide resolution
    await selectResolution(window, { width: 7680, height: 4320 });

    // Read the borderless upscale from the ini file
    const displayTweaksIni = await getDisplayTweaksIni(mockFiles);
    const borderlessUpscale = displayTweaksIni["Render"].BorderlessUpscale;

    // Check borderless upscale has been enabled
    expect(borderlessUpscale).toBe(true);
  });

  test("should disable BorderlessUpscale when non-ultrawide monitor selects ultrawide resolution", async () => {
    // Mock a non-ultrawide screen resolution
    await mockScreenResolution(electronApp, { width: 1920, height: 1080 });

    // Select an ultrawide resolution
    await selectResolution(window, { width: 3840, height: 1080 });

    // Read the borderless upscale from the ini file
    const displayTweaksIni = await getDisplayTweaksIni(mockFiles);
    const borderlessUpscale = displayTweaksIni.Render.BorderlessUpscale;

    // Check borderless upscale has been disabled
    expect(borderlessUpscale).toBe(false);
  });

  test("should disable BorderlessUpscale when ultrawide monitor selects non-ultrawide resolution", async () => {
    // Mock an ultrawide screen resolution
    await mockScreenResolution(electronApp, { width: 3440, height: 1440 });

    // Select a non-ultrawide resolution
    await selectResolution(window, { width: 7680, height: 4320 });

    // Read the borderless upscale from the ini file
    const displayTweaksIni = await getDisplayTweaksIni(mockFiles);
    const borderlessUpscale = displayTweaksIni.Render.BorderlessUpscale;

    // Check borderless upscale has been disabled
    expect(borderlessUpscale).toBe(false);
  });

  test("should enable BorderlessUpscale when ultrawide monitor selects ultrawide resolution", async () => {
    // Mock an ultrawide screen resolution
    await mockScreenResolution(electronApp, { width: 3440, height: 1440 });

    // Select an ultrawide resolution
    await selectResolution(window, { width: 3840, height: 1080 });

    // Read the borderless upscale from the ini file
    const displayTweaksIni = await getDisplayTweaksIni(mockFiles);
    const borderlessUpscale = displayTweaksIni.Render.BorderlessUpscale;

    // Check borderless upscale has been enabled
    expect(borderlessUpscale).toBe(true);
  });

  test("should enable 21:9 resolution support mod when selecting 21:9 ratio", async () => {
    // Select a 21:9 resolution (3440x1440 is a common 21:9 resolution)
    await selectResolution(window, { width: 3440, height: 1440 });

    // Check if the 21:9 resolution support mod is enabled
    const is219ModEnabled = await isModEnabled(
      "Wildlander 21-9 Resolution Support",
      mockFiles
    );
    expect(is219ModEnabled).toBe(true);

    // Check if the widescreen plugin is enabled
    const isWidescreenPluginEnabled = await isPluginEnabled(
      "widescreen_skyui_fix.esp",
      mockFiles
    );
    expect(isWidescreenPluginEnabled).toBe(true);
  });

  test("should disable 21:9 resolution support mod when selecting non-21:9 ratio", async () => {
    // First select a 21:9 resolution to ensure the mod is enabled
    await selectResolution(window, { width: 3440, height: 1440 });

    // Then select a 16:9 resolution (1920x1080 is a common 16:9 resolution)
    await selectResolution(window, { width: 1920, height: 1080 });

    // Check if the 21:9 resolution support mod is disabled
    const is219ModEnabled = await isModEnabled(
      "Wildlander 21-9 Resolution Support",
      mockFiles
    );
    expect(is219ModEnabled).toBe(false);
  });

  test("should enable 32:9 resolution support mod when selecting 32:9 ratio", async () => {
    // Select a 32:9 resolution (3840x1080 is a common 32:9 resolution from mock resolutions)
    await selectResolution(window, { width: 3840, height: 1080 });

    // Check if the 32:9 resolution support mod is enabled
    const is329ModEnabled = await isModEnabled(
      "Wildlander 32-9 Resolution Support",
      mockFiles
    );
    expect(is329ModEnabled).toBe(true);

    // Check if the widescreen plugin is enabled
    const isWidescreenPluginEnabled = await isPluginEnabled(
      "widescreen_skyui_fix.esp",
      mockFiles
    );
    expect(isWidescreenPluginEnabled).toBe(true);
  });

  test("should disable 32:9 resolution support mod when selecting non-32:9 ratio", async () => {
    // First select a 32:9 resolution to ensure the mod is enabled
    await selectResolution(window, { width: 3840, height: 1080 });

    // Then select a 16:9 resolution (1920x1080 is a common 16:9 resolution)
    await selectResolution(window, { width: 1920, height: 1080 });

    // Check if the 32:9 resolution support mod is disabled
    const is329ModEnabled = await isModEnabled(
      "Wildlander 32-9 Resolution Support",
      mockFiles
    );
    expect(is329ModEnabled).toBe(false);
  });

  test("should disable both widescreen mods and plugin when selecting 16:9 ratio", async () => {
    // First select a 21:9 resolution to ensure the mods are enabled
    await selectResolution(window, { width: 3440, height: 1440 });

    // Then select a 16:9 resolution (1920x1080 is a common 16:9 resolution)
    await selectResolution(window, { width: 1920, height: 1080 });

    // Check if both widescreen mods are disabled
    const is219ModEnabled = await isModEnabled(
      "Wildlander 21-9 Resolution Support",
      mockFiles
    );
    const is329ModEnabled = await isModEnabled(
      "Wildlander 32-9 Resolution Support",
      mockFiles
    );
    expect(is219ModEnabled).toBe(false);
    expect(is329ModEnabled).toBe(false);

    // Check if the widescreen plugin is disabled
    const isWidescreenPluginEnabled = await isPluginEnabled(
      "widescreen_skyui_fix.esp",
      mockFiles
    );
    expect(isWidescreenPluginEnabled).toBe(false);
  });

  test("should disable the Launch Game button during resolution changes", async () => {
    const launchButton = window.getByTestId("launch-game");

    // Verify the button is initially enabled
    await expect(launchButton).not.toHaveClass(/c-button--disabled/);

    // Select a resolution using the helper function
    // This will trigger the resolution change and wait for it to complete
    await selectResolution(window, { width: 1920, height: 1080 });

    // Verify the button is re-enabled after the resolution change is complete
    await expect(launchButton).not.toHaveClass(/c-button--disabled/);
  });
});

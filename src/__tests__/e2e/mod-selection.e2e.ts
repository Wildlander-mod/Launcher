import { expect, Page, test } from "@playwright/test";
import {
  CloseTestApp,
  createMockFiles,
  MockFilesPaths,
  selectFirstModpack,
  setModpackAndWaitForAppLoaded,
  startTestApp,
  waitForModDirectorySelect,
} from "./util/setup";
import type { ElectronApplication } from "playwright";
import { getUserPreferences } from "./util/user-preferences";
import { mockErrorDialog, mockScreenResolution } from "./util/mocks";
import { waitForDialogShown } from "./util/app-state";
import fs from "fs";
import fsPromises from "fs/promises";
import {
  createDirectoryStructure,
  createWabbajackInstallSettings,
} from "./util/generate-modpack-files";
import { navigateAndWait, PAGES } from "./util/navigation";
import { filesExist } from "./util/file-utils";
import path from "path";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { ENB_PRESETS } from "./util/enb";
import { PROFILES } from "./util/profile";
import { GRAPHICS_PRESETS } from "./util/graphics";
import type { Resolution } from "../../shared/types/Resolution";
import {
  isModEnabled,
  isPluginEnabled,
  getDisplayTweaksIni,
} from "./util/modlist";

test.describe("Mod Selection", () => {
  let window: Page;
  let closeTestApp: CloseTestApp;
  let mockFiles: MockFilesPaths;
  let electronApp: ElectronApplication;

  test.describe("Initial Mod Selection", () => {
    test.beforeEach(async () => {
      ({ window, closeTestApp, electronApp, mockFiles } = await startTestApp(
        test
      ));

      await waitForModDirectorySelect(window);
    });

    test.afterEach(async () => {
      await closeTestApp();
    });

    test("should show the initial mod selection screen", async () => {
      const modDirectory = window.getByTestId("mod-directory");

      await expect(modDirectory).toBeVisible();

      // Verify the welcome text is shown
      const welcomeText = await modDirectory
        .getByTestId("input-label")
        .textContent();
      expect(welcomeText).toBe(
        "To get started, select your Wildlander installation directory:"
      );
    });

    test("should select a mod directory from the initial selection", async () => {
      const modDirectoryPath = await selectFirstModpack(window);

      // Get the user preferences
      const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);

      // Verify the mod directory is set correctly
      expect(userPreferences.MOD_DIRECTORY).toBe(modDirectoryPath);
    });

    test("should show an error when selecting an invalid mod directory", async () => {
      // Attempt to select an invalid mod directory
      const modDirectorySelectTestId = "mod-directory-select";

      // Ensure the dropdown is visible
      await window.getByTestId(modDirectorySelectTestId).waitFor({
        state: "visible",
      });

      // Open the dropdown
      await window.getByTestId(modDirectorySelectTestId).click();

      // Select the option with the text `/invalid/path`
      const invalidOption = window.getByText("/invalid/path");

      const errorDialogHandle = await mockErrorDialog(electronApp);

      await invalidOption.click();

      const { title, content } = await waitForDialogShown(errorDialogHandle);

      expect({ title, content }).toEqual({
        title: "Invalid modpack directory selected",
        content:
          'Please ensure this is a valid modpack installation directory. Remember, this is NOT the Skyrim directory, it is the mod\'s installation directory. Missing files/directories: "ModOrganizer.exe","profiles","launcher"',
      });

      // Assert the mod directory selection is still visible
      await expect(window.getByTestId(modDirectorySelectTestId)).toBeVisible();

      // Verify the user preferences file is still an empty object
      const userPreferencesPath = `${mockFiles.mockFilesPath}/config/userPreferences.json`;
      const fileContents = fs.readFileSync(userPreferencesPath, "utf-8");
      expect(JSON.parse(fileContents)).toEqual({});
    });

    test("should automatically create graphics profiles when a modpack is selected", async () => {
      const modDirectoryPath = await selectFirstModpack(window);
      const profilesDirectory = path.join(modDirectoryPath, "profiles");
      const standardProfilePath = path.join(
        profilesDirectory,
        "0_Wildlander-STANDARD"
      );
      const performanceProfilePath = path.join(
        profilesDirectory,
        "0_Wildlander-PERFORMANCE"
      );
      const potatoProfilePath = path.join(
        profilesDirectory,
        "1_Wildlander-POTATO"
      );
      const highProfilePath = path.join(profilesDirectory, "1_Wildlander-HIGH");

      // Verify the new profile directories have been created
      expect(async () => {
        await fsPromises.access(standardProfilePath);
      }).not.toThrow();
      expect(async () => {
        await fsPromises.access(performanceProfilePath);
      }).not.toThrow();

      // Verify the performance profile content matches the potato profile
      const performanceProfileMatches = await filesExist(
        potatoProfilePath,
        performanceProfilePath
      );
      expect(
        performanceProfileMatches,
        "Performance profile content should match potato profile content"
      ).toBe(true);

      // Verify the standard profile content matches the high profile
      const standardProfileMatches = await filesExist(
        highProfilePath,
        standardProfilePath
      );
      expect(
        standardProfileMatches,
        "Standard profile content should match high profile content"
      ).toBe(true);
    });

    test("should set default user preferences when a modpack is selected", async () => {
      await mockScreenResolution(electronApp, { width: 1920, height: 1080 });

      const modDirectoryPath = await selectFirstModpack(window);

      const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);

      // Verify the mod directory is set correctly
      expect(userPreferences[USER_PREFERENCE_KEYS.MOD_DIRECTORY]).toBe(
        modDirectoryPath
      );

      // Verify the ENB profile is set to the default value
      expect(userPreferences[USER_PREFERENCE_KEYS.ENB_PROFILE]).toBe(
        ENB_PRESETS.ULTRA.value
      );

      // Verify the profile is set to the default value
      expect(userPreferences[USER_PREFERENCE_KEYS.PRESET]).toBe(
        PROFILES.STANDARD.value
      );

      // Verify the resolution is set to the mocked screen resolution
      const resolution = userPreferences[
        USER_PREFERENCE_KEYS.RESOLUTION
      ] as Resolution;
      expect(resolution).toEqual({
        width: 1920,
        height: 1080,
      });

      // Verify the graphics preset is set to the default value
      expect(userPreferences[USER_PREFERENCE_KEYS.GRAPHICS]).toBe(
        GRAPHICS_PRESETS.ULTRA.value
      );
    });

    test("should backup assets when a modpack is first selected", async () => {
      const modDirectoryPath = await selectFirstModpack(window);

      // Define source and backup directories
      const launcherDir = path.join(modDirectoryPath, "launcher");
      const backupsDir = path.join(launcherDir, "_backups");

      // ENB presets
      const enbPresetsDir = path.join(launcherDir, "ENB Presets");
      const enbBackupDir = path.join(backupsDir, "ENB Presets");

      // Graphics presets
      const graphicsPresetsDir = path.join(launcherDir, "Graphics Presets");
      const graphicsBackupDir = path.join(backupsDir, "graphics");

      // Profiles
      const profilesDir = path.join(modDirectoryPath, "profiles");
      const profilesBackupDir = path.join(backupsDir, "profiles");

      // Verify content matches between source and backup directories
      const enbContentMatches = await filesExist(enbPresetsDir, enbBackupDir);
      expect(
        enbContentMatches,
        "ENB presets content should be correctly backed up"
      ).toBe(true);

      const graphicsContentMatches = await filesExist(
        graphicsPresetsDir,
        graphicsBackupDir
      );
      expect(
        graphicsContentMatches,
        "Graphics presets content should be correctly backed up"
      ).toBe(true);

      const profilesContentMatches = await filesExist(
        profilesDir,
        profilesBackupDir,
        ["Skyrim.ini", "SkyrimCustom.ini", "SkyrimPrefs.ini"]
      );
      expect(
        profilesContentMatches,
        "Profile configuration files should be correctly backed up"
      ).toBe(true);
    });

    test("should copy default ENB preset files to game directory when a modpack is first selected", async () => {
      const modDirectoryPath = await selectFirstModpack(window);

      const defaultEnbPreset = ENB_PRESETS.ULTRA.value;
      const launcherDir = path.join(modDirectoryPath, "launcher");
      const enbSourceDir = path.join(
        launcherDir,
        "ENB Presets",
        defaultEnbPreset
      );
      const gameDir = path.join(modDirectoryPath, "Stock Game");

      // Verify that all files from the default ENB preset source directory have been copied to the game directory
      const enbFilesExist = await filesExist(enbSourceDir, gameDir);
      expect(
        enbFilesExist,
        "ENB preset files should be copied to the game directory"
      ).toBe(true);
    });

    test("should apply correct resolution-specific configurations when a modpack is first selected", async () => {
      await mockScreenResolution(electronApp, { width: 1920, height: 1080 });

      await selectFirstModpack(window);

      // Verify SSEDisplayTweaks.ini has been updated with the correct resolution
      const displayTweaksIni = await getDisplayTweaksIni(mockFiles);

      // Check that the resolution matches the mocked screen resolution
      expect(displayTweaksIni.Render.Resolution).toBe("1920x1080");

      // Check that BorderlessUpscale is set to true (since a 16:9 resolution is selected on a mocked 16:9 screen)
      expect(
        displayTweaksIni.Render.BorderlessUpscale,
        "BorderlessUpscale should be enabled for 16:9 resolution"
      ).toBe(true);

      // Verify widescreen mods and plugin state for 16:9 resolution
      // Check that the 21:9 resolution support mod is disabled
      const is219ModEnabled = await isModEnabled(
        "Wildlander 21-9 Resolution Support",
        mockFiles
      );
      expect(
        is219ModEnabled,
        "21:9 resolution support mod should be disabled for 16:9 resolution"
      ).toBe(false);

      // Check that the 32:9 resolution support mod is disabled
      const is329ModEnabled = await isModEnabled(
        "Wildlander 32-9 Resolution Support",
        mockFiles
      );
      expect(
        is329ModEnabled,
        "32:9 resolution support mod should be disabled for 16:9 resolution"
      ).toBe(false);

      // Check that the widescreen plugin is disabled
      const isWidescreenPluginEnabled = await isPluginEnabled(
        "widescreen_skyui_fix.esp",
        mockFiles
      );
      expect(
        isWidescreenPluginEnabled,
        "Widescreen SkyUI fix plugin should be disabled for 16:9 resolution"
      ).toBe(false);
    });

    test("should apply correct graphics configurations when a modpack is first selected", async () => {
      const modDirectoryPath = await selectFirstModpack(window);

      const graphicsDir = path.join(
        modDirectoryPath,
        "launcher",
        "Graphics Presets",
        GRAPHICS_PRESETS.ULTRA.value
      );
      const profileDir = path.join(
        modDirectoryPath,
        "profiles",
        PROFILES.STANDARD.value
      );

      // Verify all graphics files were copied correctly
      const graphicsFilesExist = await filesExist(graphicsDir, profileDir);
      expect(
        graphicsFilesExist,
        "Graphics preset files should be correctly copied to the profile directory"
      ).toBe(true);
    });
  });

  test.describe("Advanced Page Mod Selection", () => {
    let newMockFiles: MockFilesPaths;

    test.beforeEach(async () => {
      // Create a new set of mock files to swap to
      newMockFiles = await createMockFiles(test);

      ({ window, closeTestApp, electronApp, mockFiles } = await startTestApp(
        test
      ));

      // Add the new modpack to the Wabbajack settings
      createDirectoryStructure(
        {
          Wabbajack: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            saved_settings: {
              ["install-settings-9876543210.json"]: JSON.stringify(
                createWabbajackInstallSettings(newMockFiles.mockModpackPath)
              ),
            },
          },
        },
        mockFiles.mockAppDataLocalPath
      );

      await setModpackAndWaitForAppLoaded(window);
    });

    test.afterEach(async () => {
      await closeTestApp();
    });

    test("should select a different modpack from the advanced page", async () => {
      const advancedPage = await navigateAndWait(window, PAGES.ADVANCED);

      const modDirectorySelectTestId = "mod-directory-select";
      await advancedPage.getByTestId(modDirectorySelectTestId).click();

      const { mockModpackPath } = newMockFiles;

      const pageLoadedPromise = new Promise<void>((resolve) =>
        window.on("load", () => resolve())
      );

      // Select the option with the new modpack path
      const optionsContainer = window
        .getByTestId(modDirectorySelectTestId)
        .getByTestId("dropdown-options");
      await optionsContainer.getByText(mockModpackPath).click();

      // Wait for the page to have been reloaded. This happens after the modpack has been selected.
      await pageLoadedPromise;

      // Verify the mod directory dropdown shows the new selection
      const currentSelection = await window
        .getByTestId(modDirectorySelectTestId)
        .getByTestId("dropdown-head")
        .textContent();
      expect(currentSelection).toContain(mockModpackPath);

      // Get the user preferences and verify the mod directory is set correctly
      const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);
      expect(userPreferences.MOD_DIRECTORY).toBe(mockModpackPath);
    });
  });
});

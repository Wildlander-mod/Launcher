import { getUserPreferences } from "./user-preferences";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import fs from "fs/promises";
import * as os from "os";
import { MockFilesPaths } from "./setup";
import { IIniObjectSection, parse } from "js-ini";

/**
 * Reads and splits the content of a modpack file into lines, given the mock files paths and filename.
 * @param mockFiles The mock files paths object
 * @param filename The name of the file
 * @returns The lines of the file as an array of strings
 */
const readAndSplitMultilineFile = async (
  mockFiles: MockFilesPaths,
  filename: string
): Promise<string[]> => {
  const userPreferences = await getUserPreferences(mockFiles.mockFilesPath);
  const selectedProfile = userPreferences[
    USER_PREFERENCE_KEYS.PRESET
  ] as string;
  const filePath = `${mockFiles.mockModpackPath}/profiles/${selectedProfile}/${filename}`;
  const fileContent = await fs.readFile(filePath, "utf-8");
  // Split by the platform-specific line ending
  return fileContent.split(os.EOL);
};

/**
 * Helper function to check if a mod is enabled in modlist.txt for the currently selected profile
 * @param modName The name of the mod to check
 * @param mockFiles The mock files paths object
 */
export const isModEnabled = async (
  modName: string,
  mockFiles: MockFilesPaths
): Promise<boolean> => {
  // Read and split the modlist.txt file
  const mods = await readAndSplitMultilineFile(mockFiles, "modlist.txt");

  // Check if the mod is in the list and enabled
  return mods.some(
    (mod) => mod.replace(/^[-+]/, "") === modName && mod.startsWith("+")
  );
};

/**
 * Helper function to check if a plugin is enabled in plugins.txt for the currently selected profile
 * @param pluginName The name of the plugin to check
 * @param mockFiles The mock files paths object
 */
export const isPluginEnabled = async (
  pluginName: string,
  mockFiles: MockFilesPaths
): Promise<boolean> => {
  // Check the selected profile's plugins.txt
  const plugins = await readAndSplitMultilineFile(mockFiles, "plugins.txt");

  // Check if the plugin is in the list and if it's enabled (starts with *)
  return plugins.some((plugin) => {
    const pluginNameWithoutPrefix = plugin.replace(/^\*/, "").trim();
    return pluginNameWithoutPrefix === pluginName && plugin.startsWith("*");
  });
};

/**
 * Helper function to get the parsed SSEDisplayTweaks.ini file
 * @param mockFiles The mock files paths
 * @returns The parsed ini file with the correct type
 */
export const getDisplayTweaksIni = async (
  mockFiles: MockFilesPaths
): Promise<{ Render: IIniObjectSection }> => {
  const iniFilePath = `${mockFiles.mockModpackPath}/mods/Wildlander/SKSE/Plugins/SSEDisplayTweaks.ini`;
  const iniContent = await fs.readFile(iniFilePath, "utf-8");
  return parse(iniContent, { comment: "#" }) as { Render: IIniObjectSection };
};

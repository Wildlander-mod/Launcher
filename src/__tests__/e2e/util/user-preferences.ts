import fsPromises from "fs/promises";
import fs from "fs";
import type { UserPreferences } from "../../../main/services/config.service";

/**
 * Gets the user preferences from the userPreferences.json file.
 * @param mockFiles The path to the mock files directory
 * @returns The parsed user preferences object
 */
export const getUserPreferences = async (
  mockFiles: string
): Promise<UserPreferences> => {
  const userPreferencesPath = `${mockFiles}/config/userPreferences.json`;
  const userPreferencesContent = await fsPromises.readFile(
    userPreferencesPath,
    "utf-8"
  );
  return JSON.parse(userPreferencesContent);
};

/**
 * Sets a user preference in the userPreferences.json file.
 * @param mockFiles The path to the mock files directory
 * @param key The preference key to set
 * @param value The value to set for the preference
 */
export const setUserPreference = async (
  mockFiles: string,
  key: string,
  value: unknown
): Promise<void> => {
  const userPreferencesPath = `${mockFiles}/config/userPreferences.json`;
  const preferences = JSON.parse(
    await fsPromises.readFile(userPreferencesPath, "utf-8")
  );

  preferences[key] = value;

  await fsPromises.writeFile(
    userPreferencesPath,
    JSON.stringify(preferences, null, 2)
  );
};

/**
 * Removes the user preferences file to ensure the mod directory is not set.
 * This is necessary for testing the initial mod selection screen.
 * @param mockFiles The path to the mock files directory
 */
export const removeUserPreferences = async (
  mockFiles: string
): Promise<void> => {
  const userPreferencesPath = `${mockFiles}/config/userPreferences.json`;
  if (fs.existsSync(userPreferencesPath)) {
    await fsPromises.unlink(userPreferencesPath);
  }
};

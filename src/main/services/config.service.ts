import Store from "electron-store";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { Resolution } from "@/Resolution";
import path from "path";
import { BindingScope, injectable } from "@loopback/context";

export const appRoot = path.resolve(`${__dirname}/../../`);
export const isDevelopment = path.extname(appRoot) !== ".asar";

export interface UserPreferences {
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: string;
  [USER_PREFERENCE_KEYS.ENB_PROFILE]: string;
  [USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE]: string;
  [USER_PREFERENCE_KEYS.RESOLUTION]: Resolution;
}

export const userPreferences = new Store<UserPreferences>({
  name: "userPreferences",
});

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ConfigService {
  skyrimDirectory() {
    return `${userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    )}/Stock Game`;
  }

  modDirectory() {
    return userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
  }

  backupDirectory() {
    return `${this.modDirectory()}/launcher/_backups`;
  }

  getPreference<T = UserPreferences[keyof UserPreferences]>(
    key: keyof UserPreferences
  ): T {
    return userPreferences.get(key) as unknown as T;
  }

  deletePreference(key: keyof UserPreferences) {
    return userPreferences.delete(key);
  }

  setPreference(key: keyof UserPreferences | string, value: unknown) {
    return userPreferences.set(key, value);
  }

  /**
   Only set the values if they don't already exist
   */
  setDefaultPreferences(preferences: Partial<UserPreferences>) {
    for (const [key, value] of Object.entries(preferences)) {
      if (!userPreferences.has(key)) {
        this.setPreference(key, value);
      }
    }
  }

  getPreferences() {
    return userPreferences;
  }
}

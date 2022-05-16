import Store from "electron-store";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { Resolution } from "@/Resolution";
import path from "path";
import { BindingScope, injectable } from "@loopback/context";
import { logger } from "@/main/logger";

export const appRoot = path.resolve(`${__dirname}/../../`);
export const isDevelopment = path.extname(appRoot) !== ".asar";

export interface UserPreferences {
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: string;
  [USER_PREFERENCE_KEYS.ENB_PROFILE]: string;
  [USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE]: string;
  [USER_PREFERENCE_KEYS.RESOLUTION]: Resolution;
}

type PreferenceWithValidator = {
  [key in keyof UserPreferences]?: {
    value: UserPreferences[keyof UserPreferences];
    validate?: (...args: unknown[]) => boolean | Promise<boolean>;
  };
};

export const userPreferences = new Store<UserPreferences>({
  name: "userPreferences",
});

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ConfigService {
  skyrimDirectory() {
    return `${this.modDirectory()}/Stock Game`;
  }

  getLogDirectory() {
    return path.dirname(logger.transports?.file.getFile().path);
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

  hasPreference(key: keyof UserPreferences) {
    return userPreferences.has(key);
  }

  deletePreference(key: keyof UserPreferences) {
    logger.debug(`Deleting preference: ${key}`);
    return userPreferences.delete(key);
  }

  setPreference(key: keyof UserPreferences | string, value: unknown) {
    logger.debug(`Setting preference ${key} to ${value}`);
    return userPreferences.set(key, value);
  }

  /**
   Set the value specified if the key doesn't exist or the current value is invalid
   */
  async setDefaultPreferences(preferences: PreferenceWithValidator) {
    logger.debug("Setting default user preferences");
    logger.debug(`Current preferences`);
    logger.debug(this.getPreferences().store);
    for (const [key, { value, validate }] of Object.entries(preferences)) {
      const valid = validate ? await validate() : true;
      if (!valid) {
        logger.warn(
          `Current ${key} preference is invalid. Setting to default: ${value}`
        );
      }
      if ((!userPreferences.has(key) || !valid) && value) {
        this.setPreference(key, value);
      }
    }
    logger.debug("New preferences");
    logger.debug(this.getPreferences().store);
  }

  getPreferences() {
    return userPreferences;
  }
}

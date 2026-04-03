import Store from "electron-store";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import type { Resolution } from "@/shared/types/Resolution";
import path from "path";
import { BindingScope, inject, injectable } from "@loopback/context";
import { Logger, LoggerBinding } from "@/main/logger";
import fs from "fs";
import { ConfigBinding } from "@/main/bindings/config.binding";
import { Context } from "@loopback/core";

export const appRoot = path.resolve(`${__dirname}/../`);
export interface UserPreferences {
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: string;
  [USER_PREFERENCE_KEYS.GRAPHICS]: string;
  [USER_PREFERENCE_KEYS.ENB_PROFILE]: string;
  [USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE]: string;
  [USER_PREFERENCE_KEYS.RESOLUTION]: Resolution;
  [USER_PREFERENCE_KEYS.SHOW_HIDDEN_PROFILE]: boolean;
  [USER_PREFERENCE_KEYS.CHECK_PREREQUISITES]: boolean;
}

export type PreferenceWithValidator = {
  [key in keyof UserPreferences]?: {
    value: UserPreferences[keyof UserPreferences];
    validate?: (...args: unknown[]) => Promise<boolean>;
  };
};

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ConfigService {
  constructor(
    @inject(LoggerBinding) private logger: Logger,
    @inject.context() private context: Context
  ) {}

  static getNewUserPreferencesStore(): Store<UserPreferences> {
    return new Store<UserPreferences>({
      name: "userPreferences",
      ...(process.env["CONFIG_PATH"] && { cwd: process.env["CONFIG_PATH"] }),
    });
  }

  // Get config from the context dynamically so it can be mocked
  private getConfig(): Store<UserPreferences> {
    return this.context.getSync<Store<UserPreferences>>(ConfigBinding);
  }

  skyrimDirectory() {
    return `${this.modDirectory()}/Stock Game`;
  }

  getLogDirectory() {
    return path.dirname(this.logger.transports?.file.getFile().path);
  }

  modDirectory() {
    const config = this.getConfig();
    return config.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
  }

  backupDirectory() {
    return `${this.modDirectory()}/launcher/_backups`;
  }

  backupsExist() {
    return fs.existsSync(this.backupDirectory());
  }

  getPreference<T = UserPreferences[keyof UserPreferences]>(
    key: keyof UserPreferences
  ): T {
    const config = this.getConfig();
    return config.get(key) as unknown as T;
  }

  launcherDirectory() {
    return `${this.modDirectory()}/launcher`;
  }

  hasPreference(key: keyof UserPreferences) {
    const config = this.getConfig();
    return config.has(key);
  }

  deletePreference(key: keyof UserPreferences) {
    this.logger.debug(`Deleting preference: ${key}`);
    const config = this.getConfig();
    return config.delete(key);
  }

  setPreference(key: keyof UserPreferences | string, value: unknown) {
    if (typeof value === "object") {
      this.logger.debug(
        `Setting preference ${key} to ${JSON.stringify(value)}`
      );
    } else {
      this.logger.debug(`Setting preference ${key} to ${value}`);
    }
    const config = this.getConfig();
    return config.set(key, value);
  }

  /**
   Set the value specified if the key doesn't exist or the current value is invalid
   */
  async setDefaultPreferences(
    preferences: PreferenceWithValidator
  ): Promise<void> {
    const config = this.getConfig();
    this.logger.debug("Setting default user preferences");
    this.logger.debug(`Current preferences`);
    this.logger.debug(config.store);
    for (const [key, { value, validate }] of Object.entries(preferences)) {
      const valid = validate ? await validate() : true;
      if (!valid) {
        this.logger.warn(
          `Current ${key} preference is invalid. Setting to default: ${value}`
        );
      }
      if ((!config.has(key) || !valid) && value) {
        this.setPreference(key, value);
      }
    }
    this.logger.debug("New preferences");
    this.logger.debug(config.store);
  }

  getPreferences() {
    return this.getConfig();
  }

  editPreferences() {
    const config = this.getConfig();
    return config.openInEditor();
  }
}

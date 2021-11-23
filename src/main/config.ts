import Store from "electron-store";

export const isDevelopment = process.env.NODE_ENV !== "production";

export enum USER_PREFERENCE_KEYS {
  MOD_DIRECTORY = "MOD_DIRECTORY",
  PRESET = "PRESET",
  ENB_PROFILE = "ENB_PROFILE",
}

export interface UserPreferences {
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: string;
}

export const userPreferences = new Store<UserPreferences>({
  name: "userPreferences",
  defaults: {
    [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: "",
    [USER_PREFERENCE_KEYS.PRESET]: "",
  },
});

export const skyrimDirectory = () =>
  `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/Stock Game`;

export const modDirectory = () =>
  userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);

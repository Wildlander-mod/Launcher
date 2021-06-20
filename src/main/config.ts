import Store from "electron-store";

export const isDevelopment = process.env.NODE_ENV !== "production";

export enum USER_PREFERENCE_KEYS {
  GAME_DIRECTORY = "GAME_DIRECTORY",
  MOD_DIRECTORY = "MOD_DIRECTORY",
  PRESET = "PRESET",
  ENB = "ENB"
}

export enum PRESETS {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export interface UserPreferences {
  [USER_PREFERENCE_KEYS.GAME_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: PRESETS.LOW | PRESETS.MEDIUM | PRESETS.HIGH;
  [USER_PREFERENCE_KEYS.ENB]: {
    name: string;
    path: string;
  }[];
}

export const userPreferences = new Store<UserPreferences>({
  name: "userPreferences",
  defaults: {
    [USER_PREFERENCE_KEYS.GAME_DIRECTORY]: "",
    [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: "",
    [USER_PREFERENCE_KEYS.PRESET]: PRESETS.LOW,
    [USER_PREFERENCE_KEYS.ENB]: [
      {
        name: "Ultimate Skyrim",
        path: ""
      }
    ]
  }
});

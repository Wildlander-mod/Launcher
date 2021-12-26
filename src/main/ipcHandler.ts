/**
 * Handles inter process communication
 */

import { app, dialog, ipcMain } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import fs from "fs";
import {
  closeMO2,
  getProfiles,
  launchGame,
  launchMO2,
  MO2EXE,
  restoreProfiles,
} from "@/main/modOrganizer";
import { autoUpdate } from "@/main/autoUpdate";
import { getWindow } from "@/background";
import { copyENBFiles, getENBPresets, restoreENBPresets } from "@/main/ENB";
import { handleError } from "./errorHandler";
import { getResolutions } from "@/main/resolution";
import { closeGame } from "@/main/game";
import { FriendlyDirectoryMap } from "@/modpack-metadata";
import { startupTasks } from "@/main/modpack";

export function registerHandlers() {
  ipcMain.handle(IPCEvents.MODPACK_SELECTED, startupTasks);

  ipcMain.handle(IPCEvents.LAUNCH_MO2, async () => await launchMO2());
  ipcMain.handle(IPCEvents.CLOSE_GAME, async () => {
    await closeGame();
    await closeMO2();
  });

  ipcMain.handle(IPCEvents.LAUNCH_GAME, async () => {
    try {
      await launchGame();
    } catch (error) {
      logger.error(`Failed to launch game - ${error}`);
    }
  });

  // Wait until the application is ready to check for an update
  ipcMain.on(IPCEvents.CHECK_FOR_UPDATE, () => {
    return autoUpdate();
  });

  ipcMain.on(IPCEvents.CLOSE, () => {
    getWindow().close();
    app.quit();
  });

  ipcMain.on(IPCEvents.MINIMIZE, () => {
    getWindow().minimize();
  });

  ipcMain.handle(IPCEvents.RELOAD, () => {
    getWindow().reload();
  });

  ipcMain.handle(IPCEvents.SHOW_OPEN_DIALOG, async () => {
    return dialog.showOpenDialog({ properties: ["openDirectory"] });
  });

  // Returns the index of the button pressed
  ipcMain.handle(
    IPCEvents.CONFIRMATION,
    async (event, { message, buttons }) => {
      return await dialog.showMessageBox({ message, buttons });
    }
  );

  ipcMain.handle(IPCEvents.MESSAGE, async (event, message: string) => {
    await dialog.showMessageBox({ message });
  });

  ipcMain.handle(IPCEvents.ERROR, async (event, { title, error }) => {
    await handleError(title, error);
  });

  ipcMain.handle(
    IPCEvents.GET_PRESETS,
    async (): Promise<FriendlyDirectoryMap[]> => getProfiles()
  );

  // Ensure that the mod directory contains a valid MO2 installation
  ipcMain.handle(IPCEvents.CHECK_MOD_DIRECTORY, (_event, filepath) => {
    if (!fs.existsSync(`${filepath}/${MO2EXE}`)) {
      logger.warn(
        `Selected mod directory "${filepath}" doesn't contain a valid ${MO2EXE}`
      );
      return false;
    }

    if (!fs.existsSync(`${filepath}/profiles`)) {
      logger.warn(
        `Selected mod directory "${filepath}" doesn't contain a valid profiles directory`
      );
      return false;
    }
    const invalidDirectories = [
      "Desktop",
      "Documents",
      "Downloads",
      "Program Files",
      "Program Files (x86)",
      "steamapps",
      "3D Objects",
      "Music",
      "Pictures",
      "Videos",
      "OneDrive",
    ];
    const directories = filepath.split("/");
    for (const directory of directories) {
      if (invalidDirectories.includes(directory)) {
        logger.warn(
          `Selected mod directory "${filepath}" is in an invalid directory."`
        );
        return false;
      }
    }
    return true;
  });

  ipcMain.handle(IPCEvents.COPY_ENB_FILES, async () =>
    copyENBFiles(userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE))
  );

  ipcMain.handle(IPCEvents.RESTORE_ENB_PRESETS, async () => {
    await restoreENBPresets();
    await copyENBFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE),
      false
    );
  });

  ipcMain.handle(
    IPCEvents.RESTORE_MO2_PROFILES,
    async () => await restoreProfiles()
  );

  ipcMain.handle(
    IPCEvents.GET_ENB_PRESETS,
    async (): Promise<FriendlyDirectoryMap[]> => getENBPresets()
  );

  ipcMain.handle(IPCEvents.CHECK_IF_FILE_EXISTS, async (_event, filepath) =>
    fs.existsSync(filepath)
  );

  ipcMain.handle(IPCEvents.GET_RESOLUTIONS, async () => getResolutions());
}

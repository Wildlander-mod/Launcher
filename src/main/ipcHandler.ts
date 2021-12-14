/**
 * Handles inter process communication
 */

import { app, dialog, ipcMain } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import fs from "fs";
import { closeMO2, launchGame, launchMO2, MO2EXE } from "@/main/modOrganizer";
import { autoUpdate } from "@/main/autoUpdate";
import { getWindow } from "@/background";
import { copyENBFiles, deleteAllENBFiles, getENBPresets } from "@/main/ENB";
import { handleError } from "./errorHandler";
import { getResolutions } from "@/main/graphics";
import { closeGame } from "@/main/game";

export function registerHandlers() {
  ipcMain.handle(IPCEvents.LAUNCH_MO2, async () => await launchMO2());
  ipcMain.handle(IPCEvents.CLOSE_GAME, async () => {
    await closeGame();
    await closeMO2();
  });

  ipcMain.handle(IPCEvents.LAUNCH_GAME, async () => {
    await launchGame();
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

  ipcMain.handle(IPCEvents.GET_PRESETS, async (): Promise<string[]> => {
    return fs.promises.readdir(
      `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/profiles`
    );
  });

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
    return true;
  });

  ipcMain.handle(IPCEvents.COPY_ENB_FILES, async () =>
    copyENBFiles(userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE))
  );

  ipcMain.handle(IPCEvents.DELETE_ALL_ENB_FILES, async () =>
    deleteAllENBFiles()
  );

  ipcMain.handle(IPCEvents.GET_ENB_PRESETS, async () => getENBPresets());

  ipcMain.handle(IPCEvents.CHECK_IF_FILE_EXISTS, async (_event, filepath) =>
    fs.existsSync(filepath)
  );

  ipcMain.handle(IPCEvents.GET_RESOLUTIONS, async () => getResolutions());
}

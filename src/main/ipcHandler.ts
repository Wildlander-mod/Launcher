/**
 * Handles inter process communication
 */

import { app, dialog, ipcMain } from "electron";
import path from "path";
import childProcess from "child_process";
import { IPCEvents } from "@/enums/IPCEvents";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import fs from "fs";
import { launchGame, MO2EXE } from "@/main/modOrganizer";
import { autoUpdate } from "@/main/autoUpdate";
import { getWindow } from "@/background";
import { copyGameFiles, deleteGameFiles } from "@/main/gameFiles";
import { copyEnbFiles, deleteEnbFiles } from "@/main/enb";
import { handleError } from "./errorHandler";

export function registerHandlers() {
  ipcMain.handle(IPCEvents.LAUNCH_MO2, () => {
    try {
      logger.info("Launching MO2");
      const moPath = path.join(
        userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
        MO2EXE
      );
      logger.debug(`MO2 path: ${moPath}`);
      childProcess.exec(`"${moPath}"`);
    } catch (err) {
      logger.error(`Error while opening MO2 - ${err}`);
    }
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

  // Ensure the skyrim directory contains a valid TESV.exe (Legacy edition) or SkyrimSE.exe (Special edition)
  ipcMain.handle(IPCEvents.CHECK_SKYRIM_DIRECTORY, (_event, filepath) => {
    if (
      !fs.existsSync(`${filepath}/TESV.exe`) &&
      !fs.existsSync(`${filepath}/SkyrimSE.exe`)
    ) {
      logger.warn(
        `Selected Skyrim directory "${filepath}" doesn't contain a valid TESV.exe or SkyrimSE.exe`
      );
      return false;
    }
    return true;
  });

  ipcMain.handle(IPCEvents.COPY_GAME_FILES, async () => {
    return copyGameFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
  });

  ipcMain.handle(IPCEvents.DELETE_GAME_FILES, async () => {
    return deleteGameFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
  });

  ipcMain.handle(IPCEvents.COPY_ENB_FILES, async () => {
    return copyEnbFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
  });

  ipcMain.handle(IPCEvents.DELETE_ENB_FILES, async () => {
    return deleteEnbFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
  });
}

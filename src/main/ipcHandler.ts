/**
 * Handles inter process communication
 */

import { app, dialog, ipcMain } from "electron";
import path from "path";
import childProcess from "child_process";
import { launchGame } from "./modlists";
import { IPCEvents } from "@/enums/IPCEvents";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import fs from "fs";
import { MO2EXE } from "@/main/modOrganiser";

let win: Electron.BrowserWindow;

export function getWindow() {
  return win;
}

export function setWindow(window: Electron.BrowserWindow) {
  win = window;
}

export function getWebContents() {
  return getWindow().webContents;
}

// Launch MO2. Error ID: B03-05
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
  launchGame();
});

ipcMain.on(IPCEvents.CLOSE, () => {
  win.close();
  app.quit();
});

ipcMain.on(IPCEvents.MINIMIZE, () => {
  win.minimize();
});

ipcMain.handle(IPCEvents.SHOW_OPEN_DIALOG, async () => {
  return dialog.showOpenDialog({ properties: ["openDirectory"] });
});

ipcMain.handle(IPCEvents.MESSAGE, async (event, message: string) => {
  await dialog.showMessageBox({ message });
});

ipcMain.handle(IPCEvents.ERROR, async (event, { title, error }) => {
  await dialog.showErrorBox(title, error);
});

ipcMain.handle(
  IPCEvents.GET_PRESETS,
  async (): Promise<string[]> => {
    return fs.promises.readdir(
      `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/profiles`
    );
  }
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
  return true;
});

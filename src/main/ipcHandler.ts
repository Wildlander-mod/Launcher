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
    logger.debug("Launching MO2");
    const moPath = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      "/ModOrganizer.exe"
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

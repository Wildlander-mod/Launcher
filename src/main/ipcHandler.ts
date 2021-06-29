/**
 * Handles inter process communication
 */

import { app, dialog, ipcMain, shell } from "electron";
import path from "path";
import childProcess from "child_process";
import { toLog } from "./log";
import { launchGame } from "./modlists";
import { sendError } from "./errorHandler";
import { IPCEvents } from "@/enums/IPCEvents";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";

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

// Open path to folder
ipcMain.on("open-modlist-profile", async (_event, { path }) => {
  try {
    toLog("Opening explorer path: " + path);
    await shell.openPath(path);
  } catch (err) {
    sendError("B03-03-00", "Error while opening file path! Path:" + path, err);
  }
});

// Launch MO2. Error ID: B03-05
ipcMain.on("launch-mo2", () => {
  try {
    toLog("Launching MO2");
    const moPath = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      "\\ModOrganizer.exe"
    );
    childProcess.exec('"' + moPath + '"');
  } catch (err) {
    sendError("B03-05-00", "Error while opening MO2!", err);
  }
});

// Forwards errors sent from front-end to errorHandler.js. No Error ID
ipcMain.on("error", (_event, { code, message, err, tabbed }) => {
  sendError(code, message, err, tabbed);
});

// Launch modlist. No Error ID
ipcMain.handle("launch-game", async () => {
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

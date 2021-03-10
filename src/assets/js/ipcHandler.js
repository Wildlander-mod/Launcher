/**
 * Handles IPC communication
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @module
 * @requires electron
 * @requires path
 * @requires child_process
 * @requires os
 *
 */

import { dialog, ipcMain, shell, app } from "electron";
import path from "path";
import childProcess from "child_process";
import os from "os";
import { getConfig, saveConfig, resetConfig } from "./config.js";
import { toLog, openLog, currentLogPath } from "./log.js";
import { launchGame } from "./modlists.js";
import { sendError } from "./errorHandler.js";

/**
 * Location of config file and logs
 * @type {string}
 */
const homeDirectory = path.join(os.homedir(), "Ultimate Skyrim Launcher");
/**
 * Electron BrowserWindow.webContents object
 * @typedef {object} WebContents
 */
let webContents;
let win;

export function getWindow(window) {
  if (window) {
    win = window;
  } else {
    return win;
  }
}

/**
 * Returns webContents object to modules without access to the win object.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @throws B03-02-00
 */
export function getWebContents() {
  try {
    return webContents;
  } catch (err) {
    sendError("B03-02-00", "Error while returning WebContents", err, 0);
  }
}

ipcMain.on(
  "follow-link",
  /**
   * Open hyperlinks in the default browser.
   * @author RingComics <thomasblasquez@gmail.com>
   * @version 1.0.0
   * @listens follow-link
   * @param {Electron.IpcMainEvent} _event
   * @param {string} link
   * @throws B03-02-00
   */
  (_event, { link }) => {
    try {
      toLog("Opening link: " + link, 0);
      shell.openExternal(link);
    } catch (err) {
      sendError("B03-02-00", "Error while opening web link! Link:" + link, err);
    }
  }
);
// Open path to folder. Error ID: B03-03
ipcMain.on(
  "open-modlist-profile",
  /**
   * @author RingComics <thomasblasquez@gmail.com>
   * @version 1.0.0
   * @listens follow-link
   * @param {Electron.IpcMainEvent} _event
   * @param {string} path
   * @throws B03-03-00
   */
  (_event, { path }) => {
    try {
      toLog("Opening explorer path: " + path, 0);
      shell.openPath(path);
    } catch (err) {
      sendError(
        "B03-03-00",
        "Error while opening file path! Path:" + path,
        err
      );
    }
  }
);
// Open logs folder. Error ID: B03-04
ipcMain.on("open-logs-directory", () => {
  try {
    shell.showItemInFolder(currentLogPath);
  } catch (err) {
    sendError("B03-04-00", "Error while opening logs folder!", err);
  }
});
// Launch MO2. Error ID: B03-05
ipcMain.on("launch-mo2", _event => {
  try {
    toLog("Launching MO2", 0);
    const currentConfig = getConfig(1);
    if (currentConfig === "ERROR") return;
    const moPath = path.join(currentConfig.ModDirectory, "\\ModOrganizer.exe");
    childProcess.exec('"' + moPath + '"');
  } catch (err) {
    sendError("B03-05-00", "Error while opening MO2!", err);
  }
});
// Open Developer Console. Error ID: B03-06
ipcMain.on("open-dev-tools", _event => {
  try {
    toLog("Opening developer tools", 0);
    _event.sender.openDevTools();
  } catch (err) {
    sendError("B03-06-00", "Error while opening developer tools!", err);
  }
});
// Open config file. Error ID: B03-07
ipcMain.on("open-config", () => {
  try {
    shell.openPath(path.join(homeDirectory, "options.json"));
  } catch (err) {
    sendError("B03-07-00", "Error while opening config file!", err);
  }
});
// Stores webContents on app initialization. Error ID: B03-08
ipcMain.once("initialized", _event => {
  try {
    webContents = _event.sender;
  } catch (err) {
    sendError(
      "B03-08-00",
      "Error while recieving front-end initialization confirmation",
      err,
      0
    );
  }
});
// Get Directory. Error ID: B03-09
ipcMain.handle("get-directory", async () => {
  try {
    toLog("Getting directory", 0);
    return dialog.showOpenDialogSync({
      buttonLabel: "Choose Folder",
      properties: ["openDirectory"]
    });
  } catch (err) {
    sendError("B03-09-00", "Error while getting directory path!", err, 0);
  }
});
// Forwards errors sent from front-end to errorHandler.js. No Error ID
ipcMain.on("error", (_event, { code, message, err, tabbed }) => {
  // code = String
  // message = String
  // err = ErrorConstructor
  // tabbed = Number
  sendError(code, message, err, tabbed);
});
// Get configuration. No Error ID
ipcMain.handle("get-config", async () => {
  toLog("Front-end requesting config", 0);
  return getConfig(1);
});
// Launch modlist. No Error ID
ipcMain.handle("launch-game", async _event => {
  launchGame();
});
// Reset config to default. No Error ID
ipcMain.handle("reset-config", async () => {
  toLog("Reseting configurations.", 0);
  return resetConfig();
});
// Open current log. No Error ID
ipcMain.on("open-log", () => {
  openLog();
});
// Update configuration file. No Error ID.
ipcMain.on("update-config", (_event, { newConfig }) => {
  // newConfig = JSON object
  toLog("Recieved new configuration from front-end", 0);
  saveConfig(newConfig, 1);
});
ipcMain.on("close", () => {
  win.close();
  app.quit();
});
ipcMain.on("minimize", () => {
  win.minimize();
});

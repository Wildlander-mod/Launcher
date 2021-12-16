"use strict";

import { app, BrowserWindow, protocol } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { isDevelopment } from "./main/config";
import { fatalError } from "./main/errorHandler";
import { autoUpdater } from "electron-updater";
import { logger } from "@/main/logger";
import { registerHandlers } from "@/main/ipcHandler";

// Electron __static is global to electron apps but there is no type definition for it
declare const __static: string;

// Ensure it's easy to tell where the logs for this application start
logger.debug("-".repeat(20));
autoUpdater.logger = require("electron-log");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let window: Electron.BrowserWindow;

export function getWindow() {
  return window;
}

export function getWebContents() {
  return getWindow().webContents;
}

async function createWindow() {
  logger.debug("Creating window");

  try {
    // Create the browser window.
    window = new BrowserWindow({
      frame: false,
      height: 580,
      minHeight: 580,
      maxHeight: 580,
      width: 1000,
      minWidth: 1000,
      maxWidth: 1000,
      resizable: false,
      maximizable: false,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env
          .ELECTRON_NODE_INTEGRATION as unknown as boolean,
        contextIsolation: false,
      },
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
      if (!process.env.IS_TEST) {
        window.webContents.openDevTools();
      }
    } else {
      createProtocol("app");
      // Load the index.html when not in development
      await window.loadURL("app://./index.html");
    }
  } catch (error) {
    if (error instanceof Error) {
      fatalError("Unable to create browser window", error);
    } else {
      fatalError("Unable to create browser window with unknown error", "");
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  registerHandlers();

  await createWindow();

  logger.debug("App started");
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

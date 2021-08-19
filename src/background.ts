"use strict";

import { app, BrowserWindow, nativeImage, protocol } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
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
      icon: nativeImage.createFromPath(path.join(__static, "icon.icon")),
      maximizable: false,
      resizable: false,
      webPreferences: {
        enableRemoteModule: true,
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env
          .ELECTRON_NODE_INTEGRATION as unknown as boolean,
        contextIsolation: false,
      },
      width: 1000,
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
  } catch (err) {
    fatalError("Unable to create browser window", err);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      logger.error("Vue Devtools failed to install:", e.toString());
    }
  }

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

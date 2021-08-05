"use strict";

import { app, BrowserWindow, ipcMain, nativeImage, protocol } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import { isDevelopment } from "./main/config";
import { fatalError } from "./main/errorHandler";
import { getWebContents, setWindow } from "./main/ipcHandler";
import { autoUpdater } from "electron-updater";
import { IPCEvents } from "@/enums/IPCEvents";
import fs from "fs";
import { logger } from "@/main/logger";

// Electron __static is global to electron apps but there is no type definition for it
declare const __static: string;

// Ensure it's easy to tell where the logs for this application start
logger.debug("-".repeat(20));
autoUpdater.logger = require("electron-log");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  try {
    const win = new BrowserWindow({
      frame: false,
      height: 580,
      // TODO this shouldn't allow undefined. In electron __static is undefined
      // eslint-disable-next-line no-undef
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

    setWindow(win);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
      if (!process.env.IS_TEST) {
        win.webContents.openDevTools();
      }
    } else {
      createProtocol("app");
      // Load the index.html when not in development
      await win.loadURL("app://./index.html");
    }
  } catch (err) {
    fatalError("Unable to create browser window", err);
  }
}

async function autoUpdate() {
  autoUpdater.on(IPCEvents.UPDATE_AVAILABLE, () => {
    logger.info(`Update available`);
    getWebContents().send(IPCEvents.UPDATE_AVAILABLE);
  });

  autoUpdater.on(IPCEvents.UPDATE_NOT_AVAILABLE, () => {
    logger.info(`No updates available`);
    getWebContents().send(IPCEvents.UPDATE_NOT_AVAILABLE);
  });

  autoUpdater.on(IPCEvents.UPDATE_DOWNLOADED, () => {
    logger.debug("Update downloaded");
    getWebContents().send(IPCEvents.UPDATE_DOWNLOADED);
  });

  autoUpdater.on(IPCEvents.DOWNLOAD_PROGRESS, ({ percent }) => {
    logger.debug(`Download progress ${percent}`);
    getWebContents().send(IPCEvents.DOWNLOAD_PROGRESS, Math.floor(percent));
  });

  ipcMain.on(IPCEvents.UPDATE_APP, () => {
    logger.info("Quitting and installing new app version");
    autoUpdater.quitAndInstall();
  });

  // Only try to update if in production mode or there is a dev update file
  const devAppUpdatePath = path.join(__dirname, "../dev-app-update.yml");
  if (isDevelopment && fs.existsSync(devAppUpdatePath)) {
    logger.debug(`Setting auto update path to ${devAppUpdatePath}`);
    autoUpdater.updateConfigPath = devAppUpdatePath;
    await autoUpdater.checkForUpdates();
  } else if (!isDevelopment) {
    const updateCheckResult = await autoUpdater.checkForUpdates();
    logger.debug("Auto update check result");
    logger.debug(updateCheckResult);
  } else {
    logger.debug("Skipping app update check because we're in development mode");
    getWebContents().send(IPCEvents.UPDATE_NOT_AVAILABLE);
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
  logger.debug("Creating window");

  // Wait until the application is ready to check for an update
  ipcMain.on(IPCEvents.CHECK_FOR_UPDATE, () => {
    autoUpdate();
  });

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

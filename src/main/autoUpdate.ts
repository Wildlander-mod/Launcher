import { autoUpdater } from "electron-updater";
import { IPCEvents } from "@/enums/IPCEvents";
import { logger } from "@/main/logger";
import { ipcMain } from "electron";
import path from "path";
import { isDevelopment } from "@/main/config";
import fs from "fs";
import { getWebContents } from "@/background";
import { app } from "electron";
import { networkInterfaces } from "os";

async function isConnected(): Promise<boolean> {
  const connections = networkInterfaces();
  if (connections == undefined) return false;
  let connected = false;
  if (connections != undefined) {
    Object.entries(connections).forEach((connectionGroup) => {
      connectionGroup.forEach((subConnections) => {
        if (typeof subConnections == "object")
          subConnections.forEach((connection) => {
            if (!connection["internal"]) connected = true;
          });
      });
    });
  }
  return connected;
}

export async function autoUpdate() {
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

  // Only try to update if in production mode or there is a dev update file and the user is connected
  const devAppUpdatePath = path.join(__dirname, "../dev-app-update.yml");
  if (!(await isConnected())) {
    logger.debug(
      "Skipping app update check because this device is not connected to the internet"
    );
    getWebContents().send(IPCEvents.UPDATE_NOT_AVAILABLE);
  } else if (isDevelopment && fs.existsSync(devAppUpdatePath)) {
    logger.debug(`Setting auto update path to ${devAppUpdatePath}`);
    autoUpdater.updateConfigPath = devAppUpdatePath;
    await autoUpdater.checkForUpdates();
  } else if (isDevelopment) {
    logger.debug("Skipping app update check because we're in development mode");
    getWebContents().send(IPCEvents.UPDATE_NOT_AVAILABLE);
  } else if (app.getVersion().includes("-")) {
    logger.debug(
      "Skipping app update check because this is a pre-release version"
    );
    getWebContents().send(IPCEvents.UPDATE_NOT_AVAILABLE);
  } else {
    const updateCheckResult = await autoUpdater.checkForUpdates();
    logger.debug("Auto update check result");
    logger.debug(updateCheckResult);
  }
}

import { autoUpdater } from "electron-updater";
import { IPCEvents } from "@/enums/IPCEvents";
import { logger } from "@/main/logger";
import { ipcMain } from "electron";
import path from "path";
import { isDevelopment } from "@/main/config";
import fs from "fs";
import { getWebContents } from "@/background";

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

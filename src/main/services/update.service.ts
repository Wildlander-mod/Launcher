import { autoUpdater } from "electron-updater";
import { app } from "electron";
import path from "path";
import { isDevelopment } from "@/main/services/config.service";
import fs from "fs";
import { networkInterfaces } from "os";
import { service } from "@loopback/core";
import { WindowService } from "@/main/services/window.service";
import { logger } from "@/main/logger";
import { BindingScope, injectable } from "@loopback/context";
import { UPDATE_RENDERER_EVENTS } from "@/main/controllers/update/update.events";

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

@injectable({
  scope: BindingScope.SINGLETON,
})
export class UpdateService {
  private devAppUpdatePath = path.join(
    __dirname,
    "../../../dev-app-update.yml"
  );

  constructor(@service(WindowService) private renderService: WindowService) {}

  async enableAutoUpdate() {
    let skipUpdate = false;

    this.registerEvents();

    // Only try to update if in production mode or there is a dev update file and the user is connected
    if (!(await isConnected())) {
      logger.debug(
        "Skipping app update check because this device is not connected to the internet"
      );
      skipUpdate = true;
    } else if (isDevelopment && fs.existsSync(this.devAppUpdatePath)) {
      logger.debug(`Setting auto update path to ${this.devAppUpdatePath}`);
      autoUpdater.updateConfigPath = this.devAppUpdatePath;
      await this.checkForUpdate();
    } else if (isDevelopment) {
      logger.debug(
        "Skipping app update check because we're in development mode"
      );
      skipUpdate = true;
    } else if (app.getVersion().includes("-")) {
      logger.debug(
        "Skipping app update check because this is a pre-release version"
      );
      skipUpdate = true;
    } else {
      await this.checkForUpdate();
    }

    return skipUpdate;
  }

  registerEvents() {
    autoUpdater.on(UPDATE_RENDERER_EVENTS.UPDATE_AVAILABLE, () => {
      logger.info(`Update available`);
      this.renderService
        .getWebContents()
        .send(UPDATE_RENDERER_EVENTS.UPDATE_AVAILABLE);
    });

    autoUpdater.on(UPDATE_RENDERER_EVENTS.UPDATE_NOT_AVAILABLE, () => {
      logger.info(`No updates available`);
      this.renderService
        .getWebContents()
        .send(UPDATE_RENDERER_EVENTS.UPDATE_NOT_AVAILABLE);
    });

    autoUpdater.on(UPDATE_RENDERER_EVENTS.DOWNLOAD_PROGRESS, ({ percent }) => {
      this.renderService
        .getWebContents()
        .send(UPDATE_RENDERER_EVENTS.DOWNLOAD_PROGRESS, Math.floor(percent));
    });

    autoUpdater.on(UPDATE_RENDERER_EVENTS.UPDATE_DOWNLOADED, () => {
      logger.debug("Update downloaded");
      autoUpdater.quitAndInstall();
    });
  }

  async checkForUpdate() {
    const updateCheckResult = await autoUpdater.checkForUpdates();
    logger.debug("Auto update check result");
    logger.debug(updateCheckResult);
  }
}

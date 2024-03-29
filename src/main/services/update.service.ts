import { autoUpdater } from "electron-updater";
import { app } from "electron";
import path from "path";
import { isDevelopment } from "@/main/services/config.service";
import fs from "fs";
import { service } from "@loopback/core";
import { WindowService } from "@/main/services/window.service";
import { logger } from "@/main/logger";
import { BindingScope, injectable } from "@loopback/context";
import { UPDATE_EVENTS } from "@/main/controllers/update/update.events";
import { ErrorService } from "@/main/services/error.service";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class UpdateService {
  private devAppUpdatePath = path.join(
    __dirname,
    "../../../dev-app-update.yml"
  );

  constructor(
    @service(WindowService) private renderService: WindowService,
    @service(ErrorService) private errorService: ErrorService,
    @service(WindowService) private windowService: WindowService
  ) {}

  async update() {
    await this.windowService.createBrowserWindow();
    await this.windowService.load("/auto-update");

    return new Promise<void>((resolve) => {
      // Only register if there is no update available. If there is an update, the window will close itself anyway.
      autoUpdater.on(UPDATE_EVENTS.UPDATE_NOT_AVAILABLE, () => {
        logger.debug("No update available");
        resolve();
      });

      if (this.shouldUpdate()) {
        this.checkForUpdate().catch((error) => {
          logger.debug(`Update failed with error ${error}. Continuing anyway.`);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  shouldUpdate() {
    let shouldUpdate;

    if (isDevelopment && fs.existsSync(this.devAppUpdatePath)) {
      logger.debug(`Setting auto update path to ${this.devAppUpdatePath}`);
      autoUpdater.updateConfigPath = this.devAppUpdatePath;
      shouldUpdate = true;
    } else if (isDevelopment) {
      logger.debug(
        "Skipping app update check because we're in development mode"
      );
      shouldUpdate = false;
    } else if (app.getVersion().includes("-")) {
      logger.debug(
        "Skipping app update check because this is a pre-release version"
      );
      shouldUpdate = false;
    } else {
      shouldUpdate = true;
    }

    return shouldUpdate;
  }

  registerEvents() {
    autoUpdater.on(UPDATE_EVENTS.UPDATE_AVAILABLE, () => {
      logger.info(`Update available`);
      this.renderService.getWebContents().send(UPDATE_EVENTS.UPDATE_AVAILABLE);
    });

    autoUpdater.on(UPDATE_EVENTS.DOWNLOAD_PROGRESS, ({ percent }) => {
      this.renderService
        .getWebContents()
        .send(UPDATE_EVENTS.DOWNLOAD_PROGRESS, Math.floor(percent));
    });

    autoUpdater.on(UPDATE_EVENTS.UPDATE_DOWNLOADED, () => {
      logger.debug("Update downloaded");
      autoUpdater.quitAndInstall();
    });

    autoUpdater.on(UPDATE_EVENTS.ERROR, async (error: Error) => {
      let message;
      if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
        message = `This likely means you are not connected to the internet. It is recommended you use the latest launcher version as it might contain bug fixes for the modpack itself.`;
      } else {
        message = `An unknown error has occurred. Please try relaunching the launcher.`;
      }

      await this.errorService.handleError(
        "Error checking for update",
        `Cannot check for update. ${message}`
      );
    });
  }

  async checkForUpdate() {
    this.registerEvents();
    const updateCheckResult = await autoUpdater.checkForUpdates();
    logger.debug("Auto update check result");
    logger.debug(updateCheckResult);
  }
}

import { autoUpdater } from "electron-updater";
import { app } from "electron";
import path from "path";
import { isDevelopment } from "@/main/services/config.service";
import fs from "fs";
import { service } from "@loopback/core";
import { WindowService } from "@/main/services/window.service";
import { logger } from "@/main/logger";
import { BindingScope, injectable } from "@loopback/context";
import { UPDATE_RENDERER_EVENTS } from "@/main/controllers/update/update.events";
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
    @service(ErrorService) private errorService: ErrorService
  ) {}

  async enableAutoUpdate() {
    let skipUpdate;

    this.registerEvents();

    if (isDevelopment && fs.existsSync(this.devAppUpdatePath)) {
      logger.debug(`Setting auto update path to ${this.devAppUpdatePath}`);
      autoUpdater.updateConfigPath = this.devAppUpdatePath;
      skipUpdate = await this.checkForUpdate();
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
      skipUpdate = await this.checkForUpdate();
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

    autoUpdater.on(UPDATE_RENDERER_EVENTS.ERROR, async (error: Error) => {
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

  async checkForUpdate(): Promise<boolean> {
    try {
      const updateCheckResult = await autoUpdater.checkForUpdates();
      logger.debug("Auto update check result");
      logger.debug(updateCheckResult);
      return false;
    } catch (error) {
      // If the update failed, just skip updating
      return true;
    }
  }
}

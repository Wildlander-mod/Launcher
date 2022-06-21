import path from "path";
import { BindingScope, injectable } from "@loopback/context";
import { shell, app } from "electron";
import { logger } from "@/main/logger";
import fs, { createWriteStream } from "fs";
import { service } from "@loopback/core";
import { ConfigService } from "@/main/services/config.service";
import { ErrorService } from "@/main/services/error.service";
import log from "electron-log";
import { pipeline } from "stream/promises";
import fetch from "node-fetch";
import { promisify } from "util";
import childProcess from "child_process";
import { reboot } from "electron-shutdown-command";
import { getAllInstalledSoftware } from "fetch-installed-software";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class SystemService {
  constructor(
    @service(ConfigService) private configService: ConfigService,
    @service(ErrorService) private errorService: ErrorService
  ) {}

  private installerFile = path.normalize(
    `${app.getPath("userData")}/vc_redist.x64.exe`
  );
  private prerequisitesDownloaded = false;

  static getLocalAppData() {
    return path.resolve(`${process.env.APPDATA}/../local`);
  }

  reboot() {
    logger.debug("Rebooting system");
    reboot();
  }

  async openApplicationLogsPath() {
    const error = await shell.openPath(
      path.parse(log.transports?.file.getFile().path).dir
    );
    if (error) {
      logger.error(error);
    }
  }

  async openCrashLogs() {
    const logPath = path.join(
      this.configService.modDirectory(),
      "/overwrite/NetScriptFramework/Crash"
    );

    if (fs.existsSync(logPath)) {
      const error = await shell.openPath(logPath);
      if (error) {
        logger.error(error);
      }
    } else {
      await this.errorService.handleError(
        "Error while opening crash logs folder",
        `Crash logs directory at ${logPath} does not exist. This likely means you do not have any crash logs.`
      );
    }
  }

  async clearApplicationLogs() {
    logger.transports?.file.getFile().clear();
    /*
    Due to the fact that the renderer proc has little to no node func / lib access,
    the renderer logs have to be manually cleared here.
    Because even if the entire logging object is exposed to the renderer it is unable to clear the file.
    */
    const path = logger.transports?.file.getFile().path.split("\\") || [];
    // replace main.log with renderer.log
    path.pop();
    path.push("renderer.log");

    //clear renderer.log
    const renderLog = path.join("\\");
    if (fs.existsSync(renderLog)) {
      await fs.promises.writeFile(renderLog, "", { flag: "w" });
    }
  }

  async checkPrerequisitesInstalled() {
    logger.debug("Checking prerequisites are installed");

    const productTester = "C++";
    const installedSoftware = (await getAllInstalledSoftware())
      .filter((x) => x.DisplayName?.includes(productTester))
      .map((x) => x.DisplayName);

    if (installedSoftware.length === 0) {
      logger.debug(`${productTester} not detected`);
      return false;
    }

    const installedVersions = installedSoftware.map(
      (softwareName) =>
        // Capture digits after Microsoft Visual C++ as this is the version
        softwareName?.split(/Microsoft Visual C\+\+ (\d+)/)[1]
    );

    const sortedVersions = [...new Set(installedVersions.sort())];
    logger.debug(`Installed ${productTester} versions ${sortedVersions}`);

    return installedVersions.filter((x) => Number(x) >= 2019).length > 0;
  }

  async installPrerequisites() {
    await this.downloadPrerequisites();
    logger.debug("Downloads completed");
    logger.debug(`Installing ${this.installerFile}`);
    return promisify(childProcess.exec)(`"${this.installerFile}"`);
  }

  async downloadPrerequisites() {
    logger.debug("Downloading prerequisites");
    await this.downloadFile(
      "https://aka.ms/vs/17/release/vc_redist.x64.exe",
      this.installerFile
    );

    this.prerequisitesDownloaded = true;
  }

  async downloadFile(url: string, output: string) {
    if (fs.existsSync(output)) {
      logger.debug("Download already exists, skipping");
      return;
    }

    logger.debug(`Downloading from ${url} to ${output}`);

    const body = (await fetch(url)).body;
    if (body) {
      logger.debug(`Download complete, writing to ${output}`);
      await pipeline(body, createWriteStream(output));
      logger.debug(`Finished writing to ${output}`);
    } else {
      logger.error(`Failed to download file from ${url}`);
    }
  }
}

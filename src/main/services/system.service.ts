import path from "path";
import { BindingScope, injectable } from "@loopback/context";
import { shell } from "electron";
import { logger } from "@/main/logger";
import fs from "fs";
import { service } from "@loopback/core";
import { ConfigService } from "@/main/services/config.service";
import { ErrorService } from "@/main/services/error.service";
import log from "electron-log";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class SystemService {
  constructor(
    @service(ConfigService) private configService: ConfigService,
    @service(ErrorService) private errorService: ErrorService
  ) {}

  getLocalAppData() {
    return path.resolve(`${process.env.APPDATA}/../local`);
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
}

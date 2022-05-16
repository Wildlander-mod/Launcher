import { BindingScope, injectable } from "@loopback/context";
import { ConfigService } from "@/main/services/config.service";
import { service } from "@loopback/core";
import fs from "fs";
import { logger } from "@/main/logger";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class GameService {
  constructor(@service(ConfigService) private configService: ConfigService) {}

  async copySkyrimLaunchLogs() {
    logger.info("Copying Skyrim launch logs");
    const launchLogPath = `${this.configService.skyrimDirectory()}/d3dx9_42.log`;
    const logPath = this.configService.getLogDirectory();
    if (fs.existsSync(launchLogPath)) {
      return fs.promises.copyFile(
        launchLogPath,
        `${logPath}/skyrim-launch-logs.log`
      );
    }
  }
}

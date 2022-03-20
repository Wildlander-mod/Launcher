import { controller, handle } from "@/main/decorators/controller.decorator";
import { service } from "@loopback/core";
import { SystemService } from "@/main/services/system.service";
import { SYSTEM_EVENTS } from "@/main/controllers/system/system.events";
import { shell } from "electron";
import { ErrorService } from "@/main/services/error.service";

@controller
export class SystemController {
  constructor(
    @service(SystemService) private systemService: SystemService,
    @service(ErrorService) private errorService: ErrorService
  ) {}

  @handle(SYSTEM_EVENTS.OPEN_CRASH_LOGS)
  async openCrashLogs() {
    await this.systemService.openCrashLogs();
  }

  @handle(SYSTEM_EVENTS.OPEN_APPLICATION_LOGS)
  async openApplicationLogs() {
    await this.systemService.openApplicationLogsPath();
  }

  @handle(SYSTEM_EVENTS.OPEN_LINK_IN_BROWSER)
  async openLinkInBrowser(link: string) {
    try {
      await shell.openExternal(link);
    } catch (error) {
      await this.errorService.handleError(
        "Error opening link",
        (error as Error).message
      );
    }
  }
}

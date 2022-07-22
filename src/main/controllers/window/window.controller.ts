import { controller, handle } from "@/main/decorators/controller.decorator";
import { WindowService } from "@/main/services/window.service";
import { service } from "@loopback/core";
import { WindowEvents } from "@/main/controllers/window/window.events";
import { ConfigService } from "@/main/services/config.service";

@controller
export class WindowController {
  constructor(
    @service(WindowService) private renderService: WindowService,
    @service(ConfigService) private configService: ConfigService
  ) {}

  @handle(WindowEvents.CLOSE)
  quit() {
    this.renderService.quit();
  }

  @handle(WindowEvents.RELOAD)
  reload() {
    this.renderService.reload();
  }

  @handle(WindowEvents.MINIMIZE)
  minimize() {
    this.renderService.minimize();
  }

  @handle(WindowEvents.OPEN_LOG_PATH)
  async openLogPath() {
    await this.configService;
  }
}

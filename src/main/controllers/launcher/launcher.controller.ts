import { controller, handle } from "@/main/decorators/controller.decorator";
import { LAUNCHER_EVENTS } from "@/main/controllers/launcher/launcher.events";
import { service } from "@loopback/core";
import { LauncherService } from "@/main/services/launcher.service";

@controller
export class LauncherController {
  constructor(
    @service(LauncherService) private launcherService: LauncherService
  ) {}

  @handle(LAUNCHER_EVENTS.GET_VERSION)
  getVersion() {
    return this.launcherService.getVersion();
  }
}

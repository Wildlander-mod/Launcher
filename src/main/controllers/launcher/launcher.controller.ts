import { controller, handle } from "../../decorators/controller.decorator";
import { LAUNCHER_EVENTS } from "./launcher.events";
import { service } from "@loopback/core";
import { LauncherService } from "../../services/launcher.service";

@controller
export class LauncherController {
  constructor(
    @service(LauncherService) private launcherService: LauncherService
  ) {}

  @handle(LAUNCHER_EVENTS.GET_VERSION)
  getVersion() {
    return this.launcherService.getVersion();
  }

  @handle(LAUNCHER_EVENTS.SET_CHECK_PREREQUISITES)
  setCheckPrerequisites(value: boolean) {
    return this.launcherService.setCheckPrerequisites(value);
  }

  @handle(LAUNCHER_EVENTS.GET_CHECK_PREREQUISITES)
  getCheckPrerequisites() {
    return this.launcherService.getCheckPrerequisites();
  }
}

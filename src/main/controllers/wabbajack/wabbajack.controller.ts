import { controller, handle } from "../../decorators/controller.decorator";
import { WABBAJACK_EVENTS } from "./wabbajack.events";
import { service } from "@loopback/core";
import { WabbajackService } from "../../services/wabbajack.service";

@controller
export class WabbajackController {
  constructor(
    @service(WabbajackService) private wabbajackService: WabbajackService
  ) {}

  @handle(WABBAJACK_EVENTS.GET_INSTALLED_MODPACKS)
  async getInstalledModpacks() {
    return this.wabbajackService.getInstalledCurrentModpackPaths();
  }

  @handle(WABBAJACK_EVENTS.GET_MODPACK_VERSION)
  async getVersion() {
    return this.wabbajackService.getModpackVersion();
  }
}

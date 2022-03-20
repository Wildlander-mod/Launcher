import { controller, handle } from "@/main/decorators/controller.decorator";
import { UPDATE_EVENTS } from "@/main/controllers/update/update.events";
import { UpdateService } from "@/main/services/update.service";
import { service } from "@loopback/core";

@controller
export class UpdateController {
  constructor(@service(UpdateService) private updateService: UpdateService) {}

  @handle(UPDATE_EVENTS.ENABLE_AUTO_UPDATE)
  enableAutoUpdate(): Promise<boolean> {
    return this.updateService.enableAutoUpdate();
  }
}

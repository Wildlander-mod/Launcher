import { controller, handle } from "@/main/decorators/controller.decorator";
import { service } from "@loopback/core";
import { CONFIG_EVENTS } from "@/main/controllers/config/config.events";
import { ConfigService } from "@/main/services/config.service";

@controller
export class ConfigController {
  constructor(@service(ConfigService) private configService: ConfigService) {}

  @handle(CONFIG_EVENTS.EDIT_CONFIG)
  editConfig() {
    this.configService.editPreferences();
  }
}

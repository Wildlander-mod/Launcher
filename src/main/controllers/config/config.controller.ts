import { controller, handle } from "../../decorators/controller.decorator";
import { service } from "@loopback/core";
import { CONFIG_EVENTS } from "./config.events";
import { ConfigService } from "../../services/config.service";

@controller
export class ConfigController {
  constructor(@service(ConfigService) private configService: ConfigService) {}

  @handle(CONFIG_EVENTS.EDIT_CONFIG)
  editConfig() {
    this.configService.editPreferences();
  }
}

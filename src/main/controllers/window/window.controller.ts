import { controller, handle } from "../../decorators/controller.decorator";
import { WindowService } from "../../services/window.service";
import { service } from "@loopback/core";
import { WINDOW_EVENTS } from "./window.events";

@controller
export class WindowController {
  constructor(@service(WindowService) private renderService: WindowService) {}

  @handle(WINDOW_EVENTS.CLOSE)
  quit() {
    this.renderService.quit();
  }

  @handle(WINDOW_EVENTS.RELOAD)
  reload() {
    this.renderService.reload();
  }

  @handle(WINDOW_EVENTS.MINIMIZE)
  minimize() {
    this.renderService.minimize();
  }
}

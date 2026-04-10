import { controller, handle } from "../../decorators/controller.decorator";
import { GRAPHICS_EVENTS } from "./graphics.events";
import { GraphicsService } from "../../services/graphics.service";
import { service } from "@loopback/core";

@controller
export class GraphicsController {
  constructor(
    @service(GraphicsService) private graphicsService: GraphicsService
  ) {}

  @handle(GRAPHICS_EVENTS.GET_GRAPHICS_PREFERENCE)
  getGraphicsPreference() {
    return this.graphicsService.getGraphicsPreference();
  }

  @handle(GRAPHICS_EVENTS.GET_GRAPHICS)
  getGraphics() {
    return this.graphicsService.getGraphics();
  }

  @handle(GRAPHICS_EVENTS.SET_GRAPHICS)
  setGraphics(graphics: string) {
    return this.graphicsService.setGraphics(graphics);
  }

  @handle(GRAPHICS_EVENTS.RESTORE_GRAPHICS)
  restoreGraphics() {
    return this.graphicsService.restoreGraphics();
  }
}

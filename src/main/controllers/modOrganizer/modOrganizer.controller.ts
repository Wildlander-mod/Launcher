import { controller, handle } from "@/main/decorators/controller.decorator";
import { MOD_ORGANIZER_EVENTS } from "@/main/controllers/modOrganizer/modOrganizer.events";
import { ModOrganizerService } from "@/main/services/modOrganizer.service";
import { service } from "@loopback/core";

@controller
export class ModOrganizerController {
  constructor(
    @service(ModOrganizerService)
    private modOrganizerService: ModOrganizerService
  ) {}

  @handle(MOD_ORGANIZER_EVENTS.LAUNCH_MO2)
  async launchMO2() {
    await this.modOrganizerService.launchMO2();
  }

  @handle(MOD_ORGANIZER_EVENTS.LAUNCH_GAME)
  async launchGame() {
    await this.modOrganizerService.launchGame();
  }

  @handle(MOD_ORGANIZER_EVENTS.CLOSE_MO2)
  async closeMO2() {
    await this.modOrganizerService.closeMO2();
  }

  @handle(MOD_ORGANIZER_EVENTS.IS_MO2_RUNNING)
  async isMO2Running(): Promise<boolean> {
    return this.modOrganizerService.isRunning();
  }
}

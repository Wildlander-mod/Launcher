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

  @handle(MOD_ORGANIZER_EVENTS.GET_PROFILES)
  getProfiles() {
    return this.modOrganizerService.getProfiles();
  }

  @handle(MOD_ORGANIZER_EVENTS.GET_PROFILE_PREFERENCE)
  getProfilePreference() {
    return this.modOrganizerService.getProfilePreference();
  }

  @handle(MOD_ORGANIZER_EVENTS.SET_PROFILE_PREFERENCE)
  setProfilePreference(profile: string) {
    return this.modOrganizerService.setProfilePreference(profile);
  }

  @handle(MOD_ORGANIZER_EVENTS.RESTORE_PROFILES)
  async restoreProfiles() {
    await this.modOrganizerService.restoreProfiles();
  }

  @handle(MOD_ORGANIZER_EVENTS.LAUNCH_GAME)
  async launchGame() {
    await this.modOrganizerService.launchGame();
  }
}

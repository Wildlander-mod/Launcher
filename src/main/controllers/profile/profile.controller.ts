import { controller, handle } from "@/main/decorators/controller.decorator";
import { ProfileService } from "@/main/services/profile.service";
import { service } from "@loopback/core";
import { PROFILE_EVENTS } from "@/main/controllers/profile/profile.events";

@controller
export class ProfileController {
  constructor(
    @service(ProfileService) private profileService: ProfileService
  ) {}

  @handle(PROFILE_EVENTS.GET_PROFILES)
  getProfiles() {
    return this.profileService.getProfiles();
  }

  @handle(PROFILE_EVENTS.GET_PROFILE_PREFERENCE)
  getProfilePreference() {
    return this.profileService.getProfilePreference();
  }

  @handle(PROFILE_EVENTS.SET_PROFILE_PREFERENCE)
  setProfilePreference(profile: string) {
    return this.profileService.setProfilePreference(profile);
  }

  @handle(PROFILE_EVENTS.RESTORE_PROFILES)
  async restoreProfiles() {
    await this.profileService.restoreProfiles();
  }
}

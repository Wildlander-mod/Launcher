import { controller, handle } from "@/main/decorators/controller.decorator";
import { ProfileService } from "@/main/services/profile.service";
import { service } from "@loopback/core";
import { PROFILE_EVENTS } from "@/main/controllers/profile/profile.events";
import { LauncherService } from "@/main/services/launcher.service";

@controller
export class ProfileController {
  constructor(
    @service(ProfileService) private profileService: ProfileService,
    @service(LauncherService) private launcherService: LauncherService
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
    await this.launcherService.refreshModpack();
  }

  @handle(PROFILE_EVENTS.GET_SHOW_HIDDEN_PROFILES)
  async getShowHiddenProfiles() {
    return this.profileService.getShowHiddenProfiles();
  }

  @handle(PROFILE_EVENTS.SET_SHOW_HIDDEN_PROFILES)
  async setShowHiddenProfiles(show: boolean) {
    return this.profileService.setShowHiddenProfiles(show);
  }
  @handle(PROFILE_EVENTS.GET_ENABLE_AUTO_LAUNCH)
  async getEnableAutoLaunch() {
    return this.profileService.getEnableAutoLaunch();
  }
  @handle(PROFILE_EVENTS.SET_ENABLE_AUTO_LAUNCH)
  async setEnableAutoLaunch(enable: boolean) {
    return this.profileService.setEnableAutoLaunch(enable);
  }
}

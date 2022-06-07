import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { service } from "@loopback/core";
import { ModOrganizerService } from "@/main/services/modOrganizer.service";
import { ProfileService } from "@/main/services/profile.service";
import { EnbService } from "@/main/services/enb.service";
import { ConfigService } from "@/main/services/config.service";
import { ResolutionService } from "@/main/services/resolution.service";
import { ModpackService } from "@/main/services/modpack.service";
import { BindingScope, injectable } from "@loopback/context";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class LauncherService {
  constructor(
    @service(EnbService) private enbService: EnbService,
    @service(ConfigService) private configService: ConfigService,
    @service(ResolutionService) private resolutionService: ResolutionService,
    @service(ModpackService) private modpackService: ModpackService,
    @service(ProfileService) private profileService: ProfileService,
    @service(ModOrganizerService)
    private modOrganizerService: ModOrganizerService
  ) {}

  async refreshModpack() {
    return this.setModpack(this.modpackService.getModpackDirectory());
  }

  async setModpack(filepath: string) {
    await this.configService.setPreference(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY,
      filepath
    );
    await this.validateConfig();
    await this.backupAssets();
    await this.enbService.resetCurrentEnb(false);
    await this.resolutionService.setResolution(
      this.resolutionService.getCurrentResolution()
    );
    await this.resolutionService.setShouldDisableUltraWidescreen();
  }

  async validateConfig() {
    await this.configService.setDefaultPreferences({
      [USER_PREFERENCE_KEYS.ENB_PROFILE]: {
        value: await this.enbService.getDefaultPreference(),
        validate: async () =>
          this.enbService.isValid(await this.enbService.getEnbPreference()),
      },
      [USER_PREFERENCE_KEYS.PRESET]: {
        value: await this.profileService.getDefaultPreference(),
        validate: async () =>
          this.profileService.isValid(
            await this.profileService.getProfilePreference()
          ),
      },
      [USER_PREFERENCE_KEYS.RESOLUTION]: {
        value: this.resolutionService.getCurrentResolution(),
      },
    });
  }

  async backupAssets() {
    await this.enbService.backupOriginalENBs();
    await this.modOrganizerService.backupOriginalProfiles();
  }
}

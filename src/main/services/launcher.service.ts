import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { service } from "@loopback/core";
import { ModOrganizerService } from "@/main/services/modOrganizer.service";
import { ProfileService } from "@/main/services/profile.service";
import { EnbService } from "@/main/services/enb.service";
import { ConfigService } from "@/main/services/config.service";
import { ResolutionService } from "@/main/services/resolution.service";
import { ModpackService } from "@/main/services/modpack.service";
import { BindingScope, injectable } from "@loopback/context";
import { app } from "electron";
import { logger } from "@/main/logger";
import { ErrorService } from "@/main/services/error.service";
import { WindowService } from "@/main/services/window.service";

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
    private modOrganizerService: ModOrganizerService,
    @service(ErrorService) private errorService: ErrorService,
    @service(WindowService) private windowService: WindowService
  ) {}

  async refreshModpack() {
    logger.debug("Refreshing modpack");
    return this.setModpack(this.modpackService.getModpackDirectory());
  }

  async setModpack(filepath: string) {
    try {
      await this.configService.setPreference(
        USER_PREFERENCE_KEYS.MOD_DIRECTORY,
        filepath
      );
      await this.validateConfig();
      await this.backupAssets();
      await this.enbService.resetCurrentEnb(false);
      await this.resolutionService.setResolution(
        this.resolutionService.getResolutionPreference()
      );
      await this.resolutionService.setShouldDisableUltraWidescreen();
    } catch (error) {
      if (error instanceof Error && error.message.includes("EPERM")) {
        await this.errorService.handleError(
          "Permission error",
          `
          The launcher has been unable to create/modify some files due to a permissions error.
          It is strongly recommended you restart the application as an administrator.
          If this does not work, you will need to change the permissions of the install directory.`
        );
        this.windowService.quit();
      } else {
        await this.errorService.handleUnknownError(error);
      }
    }
  }

  async validateConfig() {
    logger.debug("Validating config...");
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
    logger.debug("Config validated");
  }

  async backupAssets() {
    await this.enbService.backupOriginalENBs();
    await this.modOrganizerService.backupOriginalProfiles();
  }

  getVersion() {
    return app.getVersion();
  }
}

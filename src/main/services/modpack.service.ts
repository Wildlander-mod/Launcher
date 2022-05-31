import fs from "fs";
import { logger } from "@/main/logger";
import { service } from "@loopback/core";
import { ModOrganizerService } from "@/main/services/modOrganizer.service";
import { BindingScope, injectable } from "@loopback/context";
import { EnbService } from "@/main/services/enb.service";
import { ConfigService } from "@/main/services/config.service";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { ResolutionService } from "@/main/services/resolution.service";
import modpack from "@/modpack.json";
import { IsModpackValidResponse } from "@/main/controllers/modpack/mopack.events";
import { Modpack } from "@/modpack-metadata";
import { ProfileService } from "@/main/services/profile.service";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ModpackService {
  constructor(
    @service(ModOrganizerService)
    private modOrganizerService: ModOrganizerService,
    @service(ProfileService) private profileService: ProfileService,
    @service(EnbService) private enbService: EnbService,
    @service(ConfigService) private configService: ConfigService,
    @service(ResolutionService) private resolutionService: ResolutionService
  ) {}

  checkModpackPathIsValid(modpackPath: string): IsModpackValidResponse {
    const missingPaths = [
      this.modOrganizerService.MO2EXE,
      "profiles",
      "launcher",
    ]
      .filter((path) => !fs.existsSync(`${modpackPath}/${path}`))
      .map((path) => {
        logger.warn(
          `Selected mod directory "${modpackPath}" doesn't contain a "${path}" directory/file`
        );
        return path;
      });

    return { ok: missingPaths.length === 0, missingPaths };
  }

  checkCurrentModpackPathIsValid() {
    return (
      this.isModpackSet() &&
      this.checkModpackPathIsValid(this.getModpackDirectory()).ok
    );
  }

  async refreshModpack() {
    return this.setModpack(this.getModpackDirectory());
  }

  getModpackDirectory() {
    return this.configService.getPreference<string>(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );
  }

  getModpackMetadata(): Modpack {
    return modpack;
  }

  deleteModpackDirectory() {
    return this.configService.deletePreference(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );
  }

  async setModpack(filepath: string) {
    await this.configService.setPreference(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY,
      filepath
    );
    await this.validateConfig();
    await this.backupAssets();
    await this.enbService.resetCurrentEnb(false);
    await this.resolutionService.setResolutionInGraphicsSettings();
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

  isModpackSet(): boolean {
    return this.configService
      .getPreferences()
      .has(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
  }
}

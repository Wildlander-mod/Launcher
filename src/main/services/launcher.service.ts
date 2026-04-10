import { USER_PREFERENCE_KEYS } from "../../shared/enums/userPreferenceKeys";
import { service } from "@loopback/core";
import { ProfileService } from "./profile.service";
import { EnbService } from "./enb.service";
import { ConfigService } from "./config.service";
import { ResolutionService } from "./resolution.service";
import { ModpackService } from "./modpack.service";
import { BindingScope, inject, injectable } from "@loopback/context";
import { ErrorService } from "./error.service";
import { WindowService } from "./window.service";
import { GraphicsService } from "./graphics.service";
import { MigrationService } from "./migration.service";
import { type Logger, LoggerBinding } from "../logger";
import { VersionBinding } from "../bindings/version.binding";

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
    @service(ErrorService) private errorService: ErrorService,
    @service(WindowService) private windowService: WindowService,
    @service(GraphicsService) private graphicsService: GraphicsService,
    @service(MigrationService) private migrationService: MigrationService,
    @inject(LoggerBinding) private logger: Logger,
    @inject(VersionBinding) private version: string
  ) {}

  async refreshModpack() {
    this.logger.debug("Refreshing modpack");
    return this.setModpack(this.modpackService.getModpackDirectory());
  }

  async setModpack(filepath: string) {
    try {
      this.configService.setPreference(
        USER_PREFERENCE_KEYS.MOD_DIRECTORY,
        filepath
      );
      await this.migrationService.separateProfileFromGraphics();
      await this.validateConfig();
      await this.backupAssets();
      await this.enbService.resetCurrentEnb(false);
      await this.resolutionService.setResolution(
        this.resolutionService.getResolutionPreference()
      );
      await this.resolutionService.setShouldDisableUltraWidescreen();
      await this.graphicsService.setGraphics(
        this.graphicsService.getGraphicsPreference()
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("EPERM")) {
        this.errorService.handleError(
          "Permission error",
          `
          The launcher has been unable to create/modify some files due to a permissions error.
          It is strongly recommended you restart the application as an administrator.
          If this does not work, you will need to change the permissions of the install directory.`
        );
        this.windowService.quit();
      } else {
        this.errorService.handleUnknownError(error);
      }
    }
  }

  async validateConfig() {
    this.logger.debug("Validating config...");
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
      [USER_PREFERENCE_KEYS.GRAPHICS]: {
        value: await this.graphicsService.getDefaultPreference(),
        validate: async () =>
          this.graphicsService.isValid(
            this.graphicsService.getGraphicsPreference()
          ),
      },
    });
    this.logger.debug("Config validated");
  }

  async backupAssets() {
    await this.enbService.backupOriginalEnbs();
    await this.profileService.backupOriginalProfiles();
    await this.graphicsService.backupOriginalGraphics();
  }

  getVersion() {
    return this.version;
  }

  setCheckPrerequisites(value: boolean) {
    return this.configService.setPreference(
      USER_PREFERENCE_KEYS.CHECK_PREREQUISITES,
      value
    );
  }

  getCheckPrerequisites() {
    return this.configService.getPreference(
      USER_PREFERENCE_KEYS.CHECK_PREREQUISITES
    );
  }
}

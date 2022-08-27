import { service } from "@loopback/core";
import { GraphicsService } from "@/main/services/graphics.service";
import { logger } from "@/main/logger";
import { ProfileService } from "@/main/services/profile.service";
import fs from "fs";
import path from "path";
import { ConfigService } from "@/main/services/config.service";
import { copy } from "fs-extra";
import { asyncFilter } from "@/shared/util/asyncFilter";

export class MigrationService {
  constructor(
    @service(GraphicsService) private graphicsService: GraphicsService,
    @service(ProfileService) private profileService: ProfileService,
    @service(ConfigService) private configService: ConfigService
  ) {}

  private standardProfileName = "0_Wildlander-STANDARD";
  private performanceProfileName = "0_Wildlander-PERFORMANCE";

  /**
   * Wildlander originally shipped with graphics settings in the profiles.
   * This makes maintenance of profiles that have the same modlists but different graphics difficult.
   * Before continuing, the launcher can transform a user's local modpack setup to match the new version.
   * This allows for separating graphics from the profile.
   * If there is any modification to the files, they will not be touched.
   */
  public async separateProfileFromGraphics() {
    const standardProfilePath = `${this.profileService.profileDirectory()}/${
      this.standardProfileName
    }`;

    const potatoProfilePath = `${this.profileService.profileDirectory()}/${
      this.performanceProfileName
    }`;

    logger.debug("Separate profile from graphics migration");

    if (!(await this.graphicsService.graphicsExist())) {
      logger.debug("Creating graphics presets from profiles");
      const profiles = await this.profileService.getProfileDirectories();

      logger.debug(`Creating ${this.graphicsService.graphicsMappingFile()}`);
      await copy(
        this.profileService.profileMappingFile(),
        this.graphicsService.graphicsMappingPath()
      );

      logger.debug("Creating new standard profile");
      await this.createNewProfiles(
        standardProfilePath,
        potatoProfilePath,
        profiles
      );

      logger.debug("Moving graphics out of profiles");
      await this.moveGraphicsFromProfiles(profiles);

      logger.debug("Create new mapped profile file");
      await this.createMappedProfileFile();

      logger.debug("Select first profile so the old original one isn't reused");
      await this.profileService.setProfilePreference(
        (
          await this.profileService.getProfiles()
        )[0].real
      );
      logger.debug(
        `New profile is ${await this.profileService.getProfilePreference()}`
      );

      logger.debug("Migration complete");
    } else {
      logger.debug("Graphics presets already exist, not performing migration");
    }
  }

  private async createNewProfiles(
    standardProfilePath: string,
    performanceProfilePath: string,
    profiles: string[]
  ) {
    if (this.configService.backupsExist()) {
      // Create the new profiles from the backup taken when the launcher first ran
      logger.debug(
        "Create the new standard and performance profile from backup"
      );
      const backedUpProfiles =
        await this.profileService.getBackedUpProfileDirectories();
      const backedUpPerformanceProfile =
        backedUpProfiles.find((profile) =>
          profile.toLowerCase().includes("potato")
        ) ?? backedUpProfiles[backedUpProfiles.length - 1];
      await copy(backedUpProfiles[0], standardProfilePath);
      await copy(backedUpPerformanceProfile, performanceProfilePath);
    } else {
      // If there is no backup, just use the first one
      logger.debug(
        "Create the new standard profile from the first profile in the list because no backup exists"
      );
      const performanceProfile =
        profiles.find((profile) => profile.toLowerCase().includes("potato")) ??
        profiles[[profiles].length - 1];
      await copy(profiles[0], standardProfilePath);
      await copy(performanceProfile, standardProfilePath);
    }
  }

  private async moveGraphicsFromProfiles(profiles: string[]) {
    for (const profile of profiles) {
      const graphics = await this.getGraphicsFilesForProfile(profile);

      for (const file of graphics) {
        await this.moveGraphicsFiles(path.basename(profile), file);
      }
    }
  }

  private async getGraphicsFilesForProfile(profile: string) {
    const files = (await fs.promises.readdir(profile)).map(
      (file) => `${profile}/${file}`
    );
    return this.graphicsService.extractGraphicsFiles(files);
  }

  private async moveGraphicsFiles(profile: string, file: string) {
    const graphicsDirectory = `${this.graphicsService.graphicsDirectory()}/${profile}`;
    await fs.promises.mkdir(graphicsDirectory, {
      recursive: true,
    });
    const dest = `${graphicsDirectory}/${path.basename(file)}`;
    logger.debug(`Move ${file} to ${dest}`);
    await fs.promises.rename(file, dest);
  }

  private async createMappedProfileFile() {
    // Set old profiles to be hidden by default
    const mappedProfiles = (await this.profileService.getMappedProfiles()).map(
      (profile) => ({
        ...profile,
        hidden: true,
      })
    );

    const validProfileMappings = await asyncFilter(
      mappedProfiles,
      async ({ real }) => this.profileService.isValid(real)
    );

    // Add the new profile mappings to the old one so the new profiles have friendly names
    await fs.promises.writeFile(
      this.profileService.profileMappingFile(),
      JSON.stringify([
        {
          real: this.standardProfileName,
          friendly: "Standard Modlist",
        },
        {
          real: this.performanceProfileName,
          friendly: "Performance Modlist",
        },
        ...validProfileMappings,
      ])
    );
  }
}

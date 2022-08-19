import { service } from "@loopback/core";
import { GraphicsService } from "@/main/services/graphics.service";
import { logger } from "@/main/logger";
import { ProfileService } from "@/main/services/profile.service";
import fs from "fs";
import path from "path";
import { compare } from "dir-compare";
import { ConfigService } from "@/main/services/config.service";
import { copy } from "fs-extra";

export class MigrationService {
  constructor(
    @service(GraphicsService) private graphicsService: GraphicsService,
    @service(ProfileService) private profileService: ProfileService,
    @service(ConfigService) private configService: ConfigService
  ) {}

  private standardProfileName = "1_Wildlander-STANDARD";

  /**
   * Wildlander originally shipped with graphics settings in the profiles.
   * This makes maintenance of profiles that have the same modlists but different graphics difficult.
   * Before continuing, the launcher can transform a user's local modpack setup to match the new version.
   * This allows for separating graphics from the profile.
   * If there is any modification to the files, they will not be touched.
   */
  public async separateProfileFromGraphics() {
    logger.debug("Separate profile from graphics migration");

    if (!(await this.graphicsService.graphicsExist())) {
      logger.debug("Creating graphics presets from profiles");
      const profiles = await this.profileService.getProfileDirectories();

      logger.debug(`Creating ${this.graphicsService.graphicsMappingFile()}`);
      await copy(
        this.profileService.profileMappingFile(),
        this.graphicsService.graphicsMappingPath()
      );

      await fs.promises.writeFile(
        this.profileService.profileMappingFile(),
        JSON.stringify([
          {
            real: this.standardProfileName,
            friendly: "Standard Modlist",
          },
          {
            real: "5_Wildlander-POTATO",
            friendly: "Performance Modlist",
          },
        ])
      );

      for (const profile of profiles) {
        const files = await this.getGraphicsFilesForProfile(profile);
        const modified = await this.profileService.isProfileModified(
          path.basename(profile)
        );

        for (const file of files) {
          await this.moveGraphicsFile(path.basename(profile), file);
        }
        if (!profile.toLowerCase().includes("potato") && !modified) {
          await this.combineProfile(profile);
        } else if (modified) {
          await fs.promises.rename(profile, `${profile} - Customised`);
        }
      }
    } else {
      logger.debug("Graphics presets already exist, not performing migration");
    }
  }

  private async getGraphicsFilesForProfile(profile: string) {
    const files = (await fs.promises.readdir(profile)).map(
      (file) => `${profile}/${file}`
    );
    return this.graphicsService.extractGraphicsFiles(files);
  }

  private async moveGraphicsFile(profile: string, file: string) {
    const graphicsDirectory = `${this.graphicsService.graphicsDirectory()}/${profile}`;
    await fs.promises.mkdir(graphicsDirectory, {
      recursive: true,
    });
    const dest = `${graphicsDirectory}/${path.basename(file)}`;
    logger.debug(`Move ${file} to ${dest}`);
    await fs.promises.rename(file, dest);
  }

  private async combineProfile(profile: string) {
    const standardProfilePath = `${this.profileService.profileDirectory()}/${
      this.standardProfileName
    }`;
    logger.debug(`Copying ${profile} to ${standardProfilePath}`);
    await copy(profile, standardProfilePath);
    logger.debug(`Removing ${profile} because it is unmodified`);
    await fs.promises.rm(profile, { recursive: true });
  }
}

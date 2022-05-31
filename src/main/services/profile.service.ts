import { ConfigService, userPreferences } from "@/main/services/config.service";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { FriendlyDirectoryMap } from "@/modpack-metadata";
import fs from "fs";
import { not as isNotJunk } from "junk";
import { logger } from "@/main/logger";
import { copy } from "fs-extra";
import { service } from "@loopback/core";

export class ProfileService {
  constructor(@service(ConfigService) private configService: ConfigService) {}

  profileDirectory() {
    return `${userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    )}/profiles`;
  }

  async getProfiles(): Promise<FriendlyDirectoryMap[]> {
    // Get mapped profile names that have a mapping
    const mappedProfiles = JSON.parse(
      await fs.promises.readFile(
        `${userPreferences.get(
          USER_PREFERENCE_KEYS.MOD_DIRECTORY
        )}/launcher/namesMO2.json`,
        "utf-8"
      )
    ) as FriendlyDirectoryMap[];

    // Get any profiles that don't have a mapping
    const unmappedProfiles = (
      await fs.promises.readdir(
        `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/profiles`,
        { withFileTypes: true }
      )
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter(isNotJunk)
      .map(
        (preset): FriendlyDirectoryMap => ({ real: preset, friendly: preset })
      )
      // Remove any profiles that have a mapping
      .filter(
        (unmappedPreset) =>
          !mappedProfiles.find(
            (mappedPreset: FriendlyDirectoryMap) =>
              mappedPreset.real === unmappedPreset.real
          )
      );

    return [...mappedProfiles, ...unmappedProfiles];
  }

  /**
   * Return the current profile preference or the first if it is invalid
   */
  async getProfilePreference() {
    return this.configService.getPreference<string>(
      USER_PREFERENCE_KEYS.PRESET
    );
  }

  async getDefaultPreference() {
    return (await this.getProfiles())[0].real;
  }

  setProfilePreference(profile: string) {
    this.configService.setPreference(USER_PREFERENCE_KEYS.PRESET, profile);
  }

  async isInProfileList(profile: string) {
    return (
      (await this.getProfiles()).filter(({ real }) => real === profile).length >
      0
    );
  }

  async isValid(profile: string) {
    return this.isInProfileList(profile);
  }

  async restoreProfiles() {
    logger.info("Restoring MO2 profiles");
    const profileBackupDirectory = `${this.configService.backupDirectory()}/profiles`;
    await copy(profileBackupDirectory, this.profileDirectory(), {
      overwrite: true,
    });
  }
}

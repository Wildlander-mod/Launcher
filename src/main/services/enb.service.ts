import fs from "fs";
import { logger } from "@/main/logger";
import { ConfigService, userPreferences } from "@/main/services/config.service";
import { copy, existsSync } from "fs-extra";
import { not as isNotJunk } from "junk";
import { FriendlyDirectoryMap } from "@/modpack-metadata";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { service } from "@loopback/core";
import { BindingScope, injectable } from "@loopback/context";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class EnbService {
  private ENBNameMappingFile = "namesENB.json";

  constructor(@service(ConfigService) private configService: ConfigService) {}

  enbDirectory() {
    return `${userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    )}/launcher/ENB Presets`;
  }

  async getENBPresets(): Promise<FriendlyDirectoryMap[]> {
    const mappedEnbs = JSON.parse(
      await fs.promises.readFile(
        `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/launcher/${
          this.ENBNameMappingFile
        }`,
        "utf-8"
      )
    ) as FriendlyDirectoryMap[];

    const unmappedENBs = (
      await fs.promises.readdir(this.enbDirectory(), { withFileTypes: true })
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter(isNotJunk)
      .map((enb): FriendlyDirectoryMap => ({ real: enb, friendly: enb }))
      // Remove any ENBs that have a mapping
      .filter(
        (unmappedEnb) =>
          !mappedEnbs.find(
            (mappedEnb: FriendlyDirectoryMap) =>
              mappedEnb.real === unmappedEnb.real
          )
      );

    return [...mappedEnbs, ...unmappedENBs];
  }

  /**
   * Get the enb preference from the user preferences or just return the first one if it is invalid (e.g. the preference is no longer included)
   */
  async getEnbPreference() {
    const preference = this.configService.getPreference<string>(
      USER_PREFERENCE_KEYS.ENB_PROFILE
    ) as string;

    if (preference && (await this.isInPresetList(preference))) {
      return preference;
    } else {
      const preset = (await this.getENBPresets())[0].real;
      logger.debug(
        `Returning the first enb preset (${preset}) because there was either no preference or the preference was not in the list`
      );
      return preset;
    }
  }

  async isInPresetList(preset: string) {
    const presets = await this.getENBPresets();
    const isInList = presets.filter(({ real }) => real === preset).length > 0;
    if (!isInList) {
      logger.debug(
        `enb preset "${preset}" in not in preset list: ${JSON.stringify(
          presets
        )}`
      );
    }
    return isInList;
  }

  async setEnbPreference(enb: string) {
    const previousEnb = this.configService.getPreference(
      USER_PREFERENCE_KEYS.ENB_PROFILE
    );
    this.configService.setPreference(
      USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE,
      previousEnb
    );
    this.configService.setPreference(USER_PREFERENCE_KEYS.ENB_PROFILE, enb);
    return this.copyENBFiles(enb);
  }

  async backupOriginalENBs() {
    const ENBBackupDirectory = `${this.configService.backupDirectory()}/ENB Presets`;
    const backupExists = existsSync(ENBBackupDirectory);
    logger.debug(`Backup for ENBs exists: ${backupExists}`);

    if (!backupExists) {
      logger.info("No ENB backup exists. Backing up...");
      await fs.promises.mkdir(this.configService.backupDirectory(), {
        recursive: true,
      });

      await copy(this.enbDirectory(), ENBBackupDirectory);
    }
  }

  async restoreENBPresets() {
    logger.info("Restoring ENB presets");
    const ENBBackupDirectory = `${this.configService.backupDirectory()}/ENB Presets`;
    await copy(ENBBackupDirectory, this.enbDirectory(), { overwrite: true });
    await this.copyENBFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE),
      false
    );
  }

  /**
   * Get all ENB files from all presets.
   * Different presets can have different files,
   * this will list all possible files.
   */
  async getAllPossibleENBFiles() {
    const files = [];
    for (const ENB of await this.getENBPresets()) {
      files.push(
        await fs.promises.readdir(`${this.enbDirectory()}/${ENB.real}`)
      );
    }
    // Flatten and remove duplicates
    return new Set([...files.flat().filter(isNotJunk)]);
  }

  async getExistingENBFiles() {
    const ENBFiles = await this.getAllPossibleENBFiles();
    return (
      await fs.promises.readdir(this.configService.skyrimDirectory())
    ).filter((file) => ENBFiles.has(file));
  }

  async getENBFilesForPreset(preset: string) {
    return fs.promises.readdir(`${this.enbDirectory()}/${preset}`);
  }

  /**
   * Deletes all ENB files from the Skyrim directory.
   * Different ENB presets will contain different files,
   * so all presets need to be read to ensure everything is removed
   */
  async deleteAllENBFiles() {
    logger.info("Deleting ENB Files");

    const existingENBFiles = await this.getExistingENBFiles();

    for (const file of existingENBFiles) {
      const fileWithPath = `${this.configService.skyrimDirectory()}/${file}`;
      logger.debug(`Deleting ENB file ${file} with path ${fileWithPath}`);
      const isDirectory = (await fs.promises.lstat(fileWithPath)).isDirectory();
      await fs.promises.rm(fileWithPath, { recursive: isDirectory });
    }
  }

  async syncENBFromGameToPresets(preset: string | "noENB") {
    logger.info(`Syncing ENB changes back to presets for ${preset}`);
    if (preset !== "noENB") {
      const enbFiles = await this.getENBFilesForPreset(preset);
      logger.debug(
        `ENB files that need to be synced: ${JSON.stringify(enbFiles)}`
      );

      for (const file of enbFiles) {
        const fileWithPath = `${this.configService.skyrimDirectory()}/${file}`;
        const fileDestination = `${this.enbDirectory()}/${preset}/${file}`;
        logger.debug(`Copying ${file} to ${fileDestination}`);
        if (existsSync(fileWithPath)) {
          await copy(fileWithPath, fileDestination, { overwrite: true });
        }
      }
    }

    logger.info("Finished syncing ENB presets");
  }

  /**
   * Copy all ENB files from an ENB preset
   * @param profile - Must be the actual ENB profile name, not the friendly name. noENB will remove all ENB files.
   * @param sync - Whether to sync the changes from Stock Game back to the ENB Preset directory
   */
  async copyENBFiles(profile: string | "noENB", sync = true) {
    logger.info(`Copying ${profile} ENB Files prerequisite`);

    const previousProfile =
      (userPreferences.get(
        USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE
      ) as string) || "";
    if (sync && previousProfile && previousProfile !== "noENB") {
      // Sync the previous profile first so changes are not lost
      await this.syncENBFromGameToPresets(previousProfile);
    }

    await this.deleteAllENBFiles();

    logger.info(`Copying ${profile} ENB Files`);

    // All ENB files have been deleted already so nothing to do if the preset is noENB
    if (profile !== "noENB") {
      const ENBFiles = await this.getENBFilesForPreset(profile);

      for (const file of ENBFiles) {
        const fileWithPath = `${this.enbDirectory()}/${profile}/${file}`;
        const fileDestination = `${this.configService.skyrimDirectory()}/${file}`;
        logger.debug(
          `Copy ENB file ${file} with path ${fileWithPath} to ${fileDestination}`
        );
        await copy(fileWithPath, fileDestination);
      }
    }
  }
}

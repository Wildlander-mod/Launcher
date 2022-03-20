import path from "path";
import childProcess from "child_process";
import { ConfigService, userPreferences } from "@/main/services/config.service";
import find from "find-process";
import { dialog } from "electron";
import fs from "fs";
import { parse, stringify } from "js-ini";
import { IIniObjectSection } from "js-ini/src/interfaces/ini-object-section";
import { not as isNotJunk } from "junk";
import { promisify } from "util";
import { IIniObject } from "js-ini/lib/interfaces/ini-object";
import { FriendlyDirectoryMap } from "@/modpack-metadata";
import { copy, existsSync } from "fs-extra";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { logger } from "@/main/logger";
import { EnbService } from "@/main/services/enb.service";
import { service } from "@loopback/core";
import { ErrorService } from "@/main/services/error.service";
import { BindingScope, injectable } from "@loopback/context";
import { ResolutionService } from "@/main/services/resolution.service";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ModOrganizerService {
  public MO2EXE = "ModOrganizer.exe";
  private MO2Settings = "ModOrganizer.ini";
  private previousMO2Settings: IIniObject | null = null;

  constructor(
    @service(EnbService) private enbService: EnbService,
    @service(ErrorService) private errorService: ErrorService,
    @service(ConfigService) private configService: ConfigService,
    @service(ResolutionService) private resolutionService: ResolutionService
  ) {}

  async isRunning() {
    return (await find("name", "ModOrganizer")).length > 0;
  }

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
    const preference = this.configService.getPreference<string>(
      USER_PREFERENCE_KEYS.PRESET
    );
    if (preference && (await this.isInProfileList(preference))) {
      return preference;
    } else {
      return (await this.getProfiles())[0].real;
    }
  }

  setProfilePreference(profile: string) {
    this.configService.setPreference(USER_PREFERENCE_KEYS.PRESET, profile);
  }

  async isInProfileList(profile: string) {
    return (await this.getProfiles()).filter(({ real }) => real === profile);
  }

  async closeMO2() {
    logger.info("Killing MO2 forcefully");
    (await find("name", "ModOrganizer")).forEach((mo2Instance) => {
      logger.debug(`Found process to kill: ${JSON.stringify(mo2Instance)}`);
      process.kill(mo2Instance.pid);
    });
    logger.info("Killed all MO2 processes");
  }

  async handleMO2Running(): Promise<boolean> {
    logger.info(
      "MO2 already running. Giving user option to cancel or continue"
    );
    const buttonSelectionIndex = await dialog.showMessageBox({
      title: "Mod Organizer running",
      message:
        "Mod Organizer 2 is already running. This could launch the wrong mod list. Would you like to close it first?",
      buttons: ["Cancel", "Close MO2 and continue"],
    });
    if (buttonSelectionIndex.response === 1) {
      await this.closeMO2();
      return true;
    } else {
      return false;
    }
  }

  async readSettings() {
    return parse(
      await fs.promises.readFile(
        `${this.configService.modDirectory()}/${this.MO2Settings}`,
        "utf-8"
      )
    );
  }

  async updateSelectedProfile(profile: string) {
    logger.info(`Updating selected profile to ${profile}`);
    const settings = await this.readSettings();

    (settings.General as IIniObjectSection)[
      "selected_profile"
    ] = `@ByteArray(${profile})`;

    await fs.promises.writeFile(
      `${this.configService.modDirectory()}/${this.MO2Settings}`,
      stringify(settings)
    );
  }

  async preventMO2GUIFromShowing() {
    logger.info(`Preventing the MO2 GUI from showing`);
    const settings = await this.readSettings();
    // Copy the object so changes don't mutate it
    this.previousMO2Settings = JSON.parse(
      JSON.stringify(settings)
    ) as IIniObject;

    (settings.Settings as IIniObjectSection)["lock_gui"] = false;

    await fs.promises.writeFile(
      `${this.configService.modDirectory()}/${this.MO2Settings}`,
      stringify(settings)
    );
  }

  async restoreMO2Settings() {
    logger.info("Restoring MO2 settings");
    // If we have some previous settings saved, restore them
    if (this.previousMO2Settings) {
      await fs.promises.writeFile(
        `${this.configService.modDirectory()}/${this.MO2Settings}`,
        stringify(this.previousMO2Settings)
      );
      this.previousMO2Settings = null;
    }
    logger.info("Finished restoring MO2 settings");
  }

  /**
   * Prepare MO2/Skyrim for launch.
   * Return true if the operation should continue and false if it should be aborted
   */
  async prepareForLaunch(): Promise<boolean> {
    if (await this.isRunning()) {
      const continueLaunching = await this.handleMO2Running();
      if (!continueLaunching) {
        logger.info("MO2 already running, user chose to abort");
        return false;
      }
    }

    await this.resolutionService.setResolutionInGraphicsSettings();

    logger.debug(
      `User configuration: ${JSON.stringify(userPreferences.store)}`
    );

    return true;
  }

  async backupOriginalProfiles() {
    const profileBackupDirectory = `${this.configService.backupDirectory()}/profiles`;
    const backupExists = existsSync(profileBackupDirectory);
    logger.debug(`Backup for profiles exists: ${backupExists}`);

    if (!backupExists) {
      logger.info("No profiles backup exists. Backing up...");
      await fs.promises.mkdir(this.configService.backupDirectory(), {
        recursive: true,
      });

      await copy(this.profileDirectory(), profileBackupDirectory);
    }
  }

  async restoreProfiles() {
    logger.info("Restoring MO2 profiles");
    const profileBackupDirectory = `${this.configService.backupDirectory()}/profiles`;
    await copy(profileBackupDirectory, this.profileDirectory(), {
      overwrite: true,
    });
  }

  async launchMO2() {
    logger.info("Preparing MO2 for launch");

    try {
      const continueLaunch = await this.prepareForLaunch();
      if (!continueLaunch) {
        return;
      }

      logger.info("Launching MO2");

      // MO2 will not respect the profile set in the launcher until the config is edited
      await this.updateSelectedProfile(
        userPreferences.get(USER_PREFERENCE_KEYS.PRESET)
      );

      const MO2Path = path.join(
        userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
        this.MO2EXE
      );
      const { stderr } = await promisify(childProcess.exec)(`"${MO2Path}"`);
      if (stderr) {
        logger.error(`Error while executing ModOrganizer - ${stderr}`);
      }
    } catch (error) {
      logger.error(`Error while opening MO2 - ${error}`);
      throw error;
    }
  }

  async launchGame() {
    logger.info("Preparing game for launch");

    try {
      const continueLaunch = await this.prepareForLaunch();
      if (!continueLaunch) {
        return;
      }

      await this.preventMO2GUIFromShowing();

      logger.info("Launching game");

      const MO2Path = path.join(
        userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
        this.MO2EXE
      );
      const profile = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);

      const execCMD = `"${MO2Path}" -p "${profile}" "moshortcut://:SKSE"`;
      logger.debug(`Executing MO2 command: ${execCMD}`);

      const { stderr } = await promisify(childProcess.exec)(execCMD);
      logger.info("MO2 exited");
      await this.restoreMO2Settings();
      await this.enbService.syncENBFromGameToPresets(
        userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE)
      );
      if (stderr) {
        logger.error(`Error while executing ModOrganizer - ${stderr}`);
      }
    } catch (error) {
      logger.error(`Failed to launch game - ${error}`);
      await this.restoreMO2Settings();
      await this.enbService.syncENBFromGameToPresets(
        userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE)
      );
      await this.errorService.handleError(
        "Error launching modlist",
        `${error}`
      );
    }
  }
}

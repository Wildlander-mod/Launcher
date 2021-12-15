import path from "path";
import childProcess from "child_process";
import {
  modDirectory,
  USER_PREFERENCE_KEYS,
  userPreferences,
} from "@/main/config";
import { logger } from "@/main/logger";
import { checkENBFilesExist, copyENBFiles, getENBPresets } from "@/main/ENB";
import { handleError } from "@/main/errorHandler";
import find from "find-process";
import { dialog } from "electron";
import fs from "fs";
import { setResolution } from "@/main/resolution";
import { parse, stringify } from "js-ini";
import { IIniObjectSection } from "js-ini/src/interfaces/ini-object-section";
import { not as isNotJunk } from "junk";
import { promisify } from "util";
import { IIniObject } from "js-ini/lib/interfaces/ini-object";

export interface FriendlyDirectoryMap {
  real: string;
  friendly: string;
}

export const MO2EXE = "ModOrganizer.exe";
const MO2Settings = "ModOrganizer.ini";

let previousMO2Settings: IIniObject | null = null;

const isRunning = async () => (await find("name", "ModOrganizer")).length > 0;

export const closeMO2 = async () =>
  (await find("name", "ModOrganizer")).forEach((mo2Instance) => {
    process.kill(mo2Instance.pid);
  });

const handleMO2Running = async (): Promise<boolean> => {
  logger.info("MO2 already running. Giving user option to cancel or continue");
  const buttonSelectionIndex = await dialog.showMessageBox({
    title: "Mod Organizer running",
    message:
      "Mod Organizer 2 is already running. This could launch the wrong mod list. Would you like to close it first?",
    buttons: ["Cancel", "Close MO2 and continue"],
  });
  if (buttonSelectionIndex.response === 1) {
    await closeMO2();
    return true;
  } else {
    return false;
  }
};

const readSettings = async () =>
  parse(
    await fs.promises.readFile(`${modDirectory()}/${MO2Settings}`, "utf-8")
  );

const updateSelectedProfile = async (profile: string) => {
  logger.info(`Updating selected profile to ${profile}`);
  const settings = await readSettings();

  (settings.General as IIniObjectSection)[
    "selected_profile"
  ] = `@ByteArray(${profile})`;

  await fs.promises.writeFile(
    `${modDirectory()}/${MO2Settings}`,
    stringify(settings)
  );
};

async function copyENBFilesIfNotExist() {
  logger.info("Ensuring ENB files exist on launch");

  const ENBFilesExist = await checkENBFilesExist();
  logger.debug(`ENB files exist on launch: ${ENBFilesExist}`);
  if (!ENBFilesExist) {
    const currentProfile =
      (userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE) as string) ||
      (await getENBPresets())[0];
    await copyENBFiles(currentProfile);
  }
}

const preventMO2GUIFromShowing = async () => {
  logger.info(`Preventing the MO2 GUI from showing`);
  const settings = await readSettings();
  // Copy the object so changes don't mutate it
  previousMO2Settings = JSON.parse(JSON.stringify(settings)) as IIniObject;

  (settings.Settings as IIniObjectSection)["lock_gui"] = false;

  await fs.promises.writeFile(
    `${modDirectory()}/${MO2Settings}`,
    stringify(settings)
  );
};

const restoreMO2Settings = async () => {
  // If we have some previous settings saved, restore them
  if (previousMO2Settings) {
    await fs.promises.writeFile(
      `${modDirectory()}/${MO2Settings}`,
      stringify(previousMO2Settings)
    );
    previousMO2Settings = null;
  }
};

/**
 * Prepare MO2/Skyrim for launch.
 * Return true if the operation should continue and false if it should be aborted
 */
const prepareForLaunch = async (): Promise<boolean> => {
  if (await isRunning()) {
    const continueLaunching = await handleMO2Running();
    if (!continueLaunching) {
      logger.info("MO2 already running, user chose to abort");
      return false;
    }
  }

  await copyENBFilesIfNotExist();

  await setResolution();

  logger.debug(`User configuration: ${JSON.stringify(userPreferences.store)}`);

  return true;
};

export const launchMO2 = async () => {
  logger.info("Preparing MO2 for launch");

  try {
    const continueLaunch = await prepareForLaunch();
    if (!continueLaunch) {
      return;
    }

    logger.info("Launching MO2");

    // MO2 will not respect the profile set in the launcher until the config is edited
    await updateSelectedProfile(
      userPreferences.get(USER_PREFERENCE_KEYS.PRESET)
    );

    const MO2Path = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      MO2EXE
    );
    childProcess.exec(`"${MO2Path}"`);
  } catch (err) {
    logger.error(`Error while opening MO2 - ${err}`);
  }
};

export async function launchGame() {
  logger.info("Preparing game for launch");

  try {
    const continueLaunch = await prepareForLaunch();
    if (!continueLaunch) {
      return;
    }

    await preventMO2GUIFromShowing();

    logger.info("Launching game");

    const MO2Path = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      MO2EXE
    );
    const profile = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);

    const execCMD = `"${MO2Path}" -p "${profile}" "moshortcut://:SKSE"`;
    logger.debug(`Executing MO2 command: ${execCMD}`);

    const { stderr } = await promisify(childProcess.exec)(execCMD);
    await restoreMO2Settings();
    if (stderr) {
      logger.error(`Error while executing ModOrganizer - ${stderr}`);
    }
  } catch (err) {
    await restoreMO2Settings();
    await handleError(
      "Error launching modlist",
      `Note: if you just forcefully closed Skyrim, you can ignore this error. ${err}`
    );
  }
}

export async function getProfiles(): Promise<string[]> {
  // Get mapped profile names that have a mapping
  const mappedNames = JSON.parse(
    await fs.promises.readFile(
      `${userPreferences.get(
        USER_PREFERENCE_KEYS.MOD_DIRECTORY
      )}/profiles/namesMO2.json`,
      "utf-8"
    )
  );

  // Get any profiles that don't have a mapping
  const unmappedNames = (
    await fs.promises.readdir(
      `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/profiles`,
      { withFileTypes: true }
    )
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter(isNotJunk)
    .map((preset) => ({ real: preset, friendly: preset }))
    .filter(
      (unmappedPreset) =>
        !mappedNames.find(
          (mappedPreset: FriendlyDirectoryMap) =>
            mappedPreset.real === unmappedPreset.real
        )
    );

  return [...mappedNames, ...unmappedNames];
}

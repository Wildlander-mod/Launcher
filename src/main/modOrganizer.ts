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
import { setResolution } from "@/main/graphics";
import { parse, stringify } from "js-ini";
import { IIniObjectSection } from "js-ini/src/interfaces/ini-object-section";
import { promisify } from "util";

export const MO2EXE = "ModOrganizer.exe";
const MO2Settings = "ModOrganizer.ini";

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

async function copyENBFilesOnLaunch() {
  logger.info("Copying ENB files on launch");

  const ENBFilesExist = await checkENBFilesExist();
  logger.debug(`ENB files exist on launch: ${ENBFilesExist}`);
  if (!ENBFilesExist) {
    const currentProfile =
      (userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE) as string) ||
      (await getENBPresets())[0];
    await copyENBFiles(currentProfile);
  }
}

export const launchMO2 = async () => {
  logger.info("Launch MO2 prerequisites");

  try {
    if (await isRunning()) {
      const continueLaunching = await handleMO2Running();
      if (!continueLaunching) {
        logger.info("MO2 already running, user chose to abort");
        return;
      }
    }

    logger.info("Launching MO2");

    // MO2 will not respect the profile set in the launcher until the config is edited
    await updateSelectedProfile(
      userPreferences.get(USER_PREFERENCE_KEYS.PRESET)
    );

    await setResolution();

    const moPath = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      MO2EXE
    );
    logger.debug(`MO2 path: ${moPath}`);
    childProcess.exec(`"${moPath}"`);
  } catch (err) {
    logger.error(`Error while opening MO2 - ${err}`);
  }
};

export async function launchGame() {
  logger.info("Launch game prerequisites");

  try {
    if (await isRunning()) {
      const continueLaunching = await handleMO2Running();
      if (!continueLaunching) {
        logger.info("MO2 already running, user chose to abort");
        return;
      }
    }

    await copyENBFilesOnLaunch();

    await setResolution();

    logger.info("Launching game");
    logger.debug(
      `User configuration: ${JSON.stringify(userPreferences.store)}`
    );
    const MO2Path = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      MO2EXE
    );
    const profile = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);

    logger.info("Starting MO2");
    const execCMD = `"${MO2Path}" -p "${profile}" "moshortcut://:SKSE"`;
    logger.debug(`Executing MO2 command ${execCMD}`);

    const { stderr } = await promisify(childProcess.exec)(execCMD);
    if (stderr) {
      logger.error(`Error while executing ModOrganizer - ${stderr}`);
    }
  } catch (err) {
    await handleError(
      "Error while launching modlist",
      `Error while launching modlist - ${err}`
    );
  }
}

import path from "path";
import childProcess from "child_process";
import {
  modDirectory,
  USER_PREFERENCE_KEYS,
  userPreferences,
} from "@/main/config";
import { logger } from "@/main/logger";
import { checkENBFilesExist, copyENBFiles } from "@/main/ENB";
import { handleError } from "@/main/errorHandler";
import find from "find-process";
import { dialog } from "electron";
import fs from "fs";
import { parse, encode } from "ini";

export const MO2EXE = "ModOrganizer.exe";
const MO2Settings = "ModOrganizer.ini";

const isRunning = async () => (await find("name", "ModOrganizer")).length > 0;

const handleRunning = async (): Promise<boolean> => {
  const buttonSelectionIndex = await dialog.showMessageBox({
    title: "Mod Organizer running",
    message:
      "Mod Organizer 2 is already running. This could launch the wrong mod list. Would you like to close it first?",
    buttons: ["Cancel", "Close MO2 and continue"],
  });
  if (buttonSelectionIndex.response === 1) {
    (await find("name", "ModOrganizer")).forEach((mo2Instance) => {
      process.kill(mo2Instance.pid);
    });
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
  settings.General["selected_profile"] = `@ByteArray(${profile})`;
  await fs.promises.writeFile(
    `${modDirectory()}/${MO2Settings}`,
    encode(settings)
  );
};

async function copyENBFilesOnLaunch() {
  logger.info("Copying ENB files on launch");

  const ENBFilesExist = await checkENBFilesExist();
  logger.debug(`ENB files exist on launch: ${ENBFilesExist}`);
  if (!ENBFilesExist) {
    await copyENBFiles(userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE));
  }
}

export const launchMO2 = async () => {
  try {
    if (await isRunning()) {
      const continueLaunching = await handleRunning();
      if (!continueLaunching) {
        return;
      }
    }

    logger.info("Launching MO2");

    // MO2 will not respect the profile set in the launcher until the config is edited
    await updateSelectedProfile(
      userPreferences.get(USER_PREFERENCE_KEYS.PRESET)
    );

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
  try {
    if (await isRunning()) {
      const continueLaunching = await handleRunning();
      if (!continueLaunching) {
        return;
      }
    }

    await copyENBFilesOnLaunch();

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
    childProcess.exec(execCMD, (error) => {
      if (error) {
        logger.error(`Error while executing ModOrganizer - ${error.message}`);
      }
    });
  } catch (err) {
    await handleError(
      "Error while launching modlist",
      `Error while launching modlist - ${err}`
    );
  }
}

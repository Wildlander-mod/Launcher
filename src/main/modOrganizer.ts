import path from "path";
import childProcess from "child_process";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import { checkENBFilesExist, copyENBFiles } from "@/main/ENB";
import { handleError } from "@/main/errorHandler";

export const MO2EXE = "ModOrganizer.exe";

async function copyENBFilesOnLaunch() {
  logger.info("Copying ENB files on launch");

  const ENBFilesExist = await checkENBFilesExist();
  logger.debug(`ENB files exist on launch: ${ENBFilesExist}`);
  if (!ENBFilesExist) {
    await copyENBFiles(userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE));
  }
}

export const launchMO2 = () => {
  try {
    logger.info("Launching MO2");
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

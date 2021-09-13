import path from "path";
import childProcess from "child_process";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import { checkGameFilesExist, copyGameFiles } from "@/main/gameFiles";
import { checkEnbFilesExist, copyEnbFiles } from "@/main/enb";
import { handleError } from "@/main/errorHandler";

export const MO2EXE = "ModOrganizer.exe";

async function copyGameFolderFiles() {
  logger.info("Copying game files on launch");
  const gameFilesExist = await checkGameFilesExist(
    userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
    userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
  );
  logger.debug(`Game files exist on launch: ${gameFilesExist}`);
  if (!gameFilesExist) {
    await copyGameFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
  }
  const enbFilesExist = await checkEnbFilesExist(
    USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY
  );
  if (!enbFilesExist) {
    await copyEnbFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
  }
}

export async function launchGame() {
  try {
    await copyGameFolderFiles();

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

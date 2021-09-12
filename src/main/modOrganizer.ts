import path from "path";
import childProcess from "child_process";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import { copyGameFiles, checkGameFiles } from "@/main/gameFiles";
import { copyEnbFiles, checkEnbFiles } from "@/main/enb";

export const MO2EXE = "ModOrganizer.exe";

export async function launchGame() {
  try {
    logger.info('Copying game files on launch');
    const gameFilesExist = await checkGameFiles(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
    );
    logger.debug(`Game files exist on launch: ${gameFilesExist}`);
    if (!gameFilesExist) {
      copyGameFiles(
        userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
        userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
      );
    }
    const enbFilesExist = await checkEnbFiles(
      USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY
    );
    if (!enbFilesExist) {
      copyEnbFiles(
        userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
        userPreferences.get(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY)
      );
    }

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
    logger.error(`Error while launching modlist - ${err}`);
  }
}

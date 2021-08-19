import path from "path";
import childProcess from "child_process";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";

export const MO2EXE = "ModOrganizer.exe";

export function launchGame() {
  try {
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

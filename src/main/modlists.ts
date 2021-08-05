import path from "path";
import childProcess from "child_process";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import { MO2EXE } from "@/main/modOrganiser";

export function launchGame() {
  try {
    logger.info("Launching game");
    logger.debug(
      `User configuration: ${JSON.stringify(userPreferences.store)}`
    );
    const modlistPath = userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
    const MO2Path = path.join(modlistPath, MO2EXE);
    const MO2exe = "SKSE";
    const profile = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);

    logger.info("Starting MO2");
    const execCMD = `"${MO2Path}" -p "${profile}" "moshortcut://:${MO2exe}"`;
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

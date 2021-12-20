import find from "find-process";
import { logger } from "@/main/logger";

export const closeGame = async () => {
  logger.info("Closing the game forcefully");
  (await find("name", "SkyrimSE.exe")).forEach((skyrim) => {
    logger.debug(`Found process to kill ${JSON.stringify(skyrim)}`);
    process.kill(skyrim.pid);
  });
  logger.info("Killed all Skyrim processes");
};

import find from "find-process";
import { logger } from "@/main/logger";
import { BindingScope, injectable } from "@loopback/context";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class GameService {
  async closeGame() {
    logger.info("Closing the game forcefully");
    (await find("name", "SkyrimSE.exe")).forEach((skyrim) => {
      logger.debug(`Found process to kill ${JSON.stringify(skyrim)}`);
      process.kill(skyrim.pid);
    });
    logger.info("Killed all Skyrim processes");
  }
}

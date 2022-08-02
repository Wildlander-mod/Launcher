import { dialog } from "electron";
import { logger } from "@/main/logger";
import { BindingScope, injectable } from "@loopback/context";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ErrorService {
  async handleError(title: string, message: string) {
    logger.error(`${title}: ${message}`);
    logger.error(new Error().stack);
    await dialog.showErrorBox(title, message);
  }

  async handleUnknownError(error?: unknown) {
    logger.error(
      `Unknown error. The stack trace might hold more details. ${error}`
    );
    logger.error(new Error().stack);
    await dialog.showErrorBox(
      "An unknown error has occurred",
      "If you require more support, please post a message in the official modpack Discord and send your launcher log files."
    );
  }
}

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
}

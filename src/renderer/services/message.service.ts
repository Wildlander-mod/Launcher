import { DIALOG_EVENTS } from "@/main/controllers/dialog/dialog.events";
import { logger } from "@/main/logger";
import { IpcService } from "@/renderer/services/ipc.service";

export class MessageService {
  constructor(private ipcService: IpcService) {}

  async error({ title, error }: { title: string; error: string }) {
    logger.error(`${title}: ${error}`);
    await this.ipcService.invoke(DIALOG_EVENTS.ERROR, { title, error });
  }

  async confirmation(message: string, buttons: string[]) {
    return this.ipcService.invoke(DIALOG_EVENTS.CONFIRMATION, {
      message,
      buttons,
    });
  }
}

import { IpcService } from "@/renderer/services/ipc.service";
import { MODPACK_EVENTS } from "@/main/controllers/modpack/mopack.events";

export class ModpackService {
  constructor(private ipcService: IpcService) {}

  public isModDirectorySet() {
    return this.ipcService.invoke(MODPACK_EVENTS.IS_MODPACK_SET);
  }

  public getModpackDirectory() {
    return this.ipcService.invoke(MODPACK_EVENTS.GET_MODPACK);
  }

  public async isModDirectoryValid() {
    const modDirectory = await this.getModpackDirectory();
    return this.ipcService.invoke(
      MODPACK_EVENTS.IS_MODPACK_DIRECTORY_VALID,
      modDirectory
    );
  }

  public async deleteModpackDirectory() {
    await this.ipcService.invoke(MODPACK_EVENTS.DELETE_MODPACK_DIRECTORY);
  }
}

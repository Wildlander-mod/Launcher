import fs from "fs";
import { WabbajackSettingsFile } from "@/wabbajack";
import { logger } from "@/main/logger";
import { SystemService } from "@/main/services/system.service";
import { service } from "@loopback/core";
import { BindingScope, injectable } from "@loopback/context";
import { ModpackService } from "@/main/services/modpack.service";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class WabbajackService {
  private installedModpacksFilename = "installed_modlists.json";
  private wabbajackInstalledModpacksPath = `${this.systemService.getLocalAppData()}/Wabbajack/${
    this.installedModpacksFilename
  }`;

  constructor(
    @service(SystemService) private systemService: SystemService,
    @service(ModpackService) private modpackService: ModpackService
  ) {}

  async getInstalledModpacks() {
    if (fs.existsSync(this.wabbajackInstalledModpacksPath)) {
      return JSON.parse(
        await fs.promises.readFile(this.wabbajackInstalledModpacksPath, "utf-8")
      ) as WabbajackSettingsFile;
    } else {
      logger.warn(
        `${this.wabbajackInstalledModpacksPath} does not exist. No modpacks found.`
      );
      return null;
    }
  }

  async getInstalledCurrentModpackPaths() {
    const { name: modpackName } = this.modpackService.getModpackMetadata();
    const modpacks = await this.getInstalledModpacks();
    const wildlanderModpacks =
      modpacks !== null
        ? Object.keys(modpacks).filter(
            (modpack) =>
              modpack !== "$type" &&
              modpacks[modpack].ModList.Name === modpackName
          )
        : [];
    logger.info(
      `Discovered ${wildlanderModpacks.length} ${modpackName} modpack installations in ${this.installedModpacksFilename}`
    );
    logger.debug(wildlanderModpacks);
    return wildlanderModpacks;
  }
}

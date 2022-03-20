import fs from "fs";
import { WabbajackSettingsFile } from "@/wabbajack";
import { logger } from "@/main/logger";
import { SystemService } from "@/main/services/system.service";
import { service } from "@loopback/core";
import { BindingScope, injectable } from "@loopback/context";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class WabbajackService {
  private installedModpacksFilename = "installed_modlists.json";
  private wabbajackInstalledModpacksPath = `${this.systemService.getLocalAppData()}/Wabbajack/${
    this.installedModpacksFilename
  }`;

  constructor(@service(SystemService) private systemService: SystemService) {}

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

  async getInstalledWildlanderModpackPaths() {
    const modpacks = await this.getInstalledModpacks();
    const wildlanderModpacks =
      modpacks !== null
        ? Object.keys(modpacks).filter(
            (modpack) =>
              modpack !== "$type" &&
              modpacks[modpack].ModList.Name === "Wildlander"
          )
        : [];
    logger.debug(`Wildlander modpacks: ${JSON.stringify(wildlanderModpacks)}`);
    return wildlanderModpacks;
  }
}

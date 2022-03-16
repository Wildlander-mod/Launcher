import { getLocalAppData } from "@/main/system";
import fs from "fs";
import { WabbajackSettingsFile } from "@/types/wabbajack";
import { logger } from "@/main/logger";

const installedModpacksFilename = "installed_modlists.json";
const wabbajackInstalledModpacksPath = `${getLocalAppData()}/Wabbajack/${installedModpacksFilename}`;

const getInstalledModpacks = async () => {
  if (fs.existsSync(wabbajackInstalledModpacksPath)) {
    return JSON.parse(
      await fs.promises.readFile(wabbajackInstalledModpacksPath, "utf-8")
    ) as WabbajackSettingsFile;
  } else {
    logger.warn(
      `${wabbajackInstalledModpacksPath} does not exist. No modpacks found.`
    );
    return null;
  }
};

export const getInstalledWildlanderModpackPaths = async () => {
  const modpacks = await getInstalledModpacks();
  return modpacks !== null
    ? Object.keys(modpacks).filter(
        (modpack) =>
          modpack !== "$type" && modpacks[modpack].ModList.Name === "Wildlander"
      )
    : [];
};

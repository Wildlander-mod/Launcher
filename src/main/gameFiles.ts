import fse from "fs-extra";
import fs from "fs";
import { logger } from "@/main/logger";

export function copyGameFiles(modDirectory: string, skyrimDirectory: string) {
  logger.info("Copying game files");
  const gameFiles = [
    "skse_loader.exe",
    "skse_steam_loader.dll",
    "skse_1_9_32.dll",
  ];
  for (const file of gameFiles) {
    if (!fs.existsSync(`${skyrimDirectory}/${file}`)) {
      fse.copySync(
        `${modDirectory}/Game Folder Files/${file}`,
        `${skyrimDirectory}/${file}`
      );
    }
  }
}

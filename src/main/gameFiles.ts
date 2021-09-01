import fse from "fs-extra";
import fs from "fs";
import { logger } from "@/main/logger";
import { enbFiles } from "@/main/enb";

export async function copyGameFiles(
  modDirectory: string,
  skyrimDirectory: string
) {
  logger.info("Copying game files");
  const gameFolderFilesDirectory = `${modDirectory}/Game Folder Files/`;
  const gameFiles = await fs.promises.readdir(gameFolderFilesDirectory);
  const gameFilesWithoutEnb = gameFiles.filter(
    (file) => !enbFiles.includes(file)
  );
  gameFilesWithoutEnb.forEach((file) =>
    fse.copySync(
      `${gameFolderFilesDirectory}/${file}`,
      `${skyrimDirectory}/${file}`
    )
  );
}

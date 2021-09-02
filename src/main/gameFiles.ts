import fs from "fs";
import { logger } from "@/main/logger";
import { enbFiles } from "@/main/enb";

async function getFilesWithoutEnb(gameFolderFilesDirectory: string) {
  const gameFiles = await fs.promises.readdir(gameFolderFilesDirectory);
  return gameFiles.filter((file) => !enbFiles.includes(file));
}

export async function copyGameFiles(
  modDirectory: string,
  skyrimDirectory: string
) {
  logger.info("Copying game files");
  const gameFolderFilesDirectory = `${modDirectory}/Game Folder Files/`;
  const gameFilesWithoutEnb = await getFilesWithoutEnb(
    gameFolderFilesDirectory
  );
  for (const file of gameFilesWithoutEnb) {
    await fs.promises.copyFile(
      `${gameFolderFilesDirectory}/${file}`,
      `${skyrimDirectory}/${file}`
    );
  }
}

export async function deleteGameFiles(
  modDirectory: string,
  skyrimDirectory: string
) {
  logger.info("Deleting game files");
  const gameFolderFilesDirectory = `${modDirectory}/Game Folder Files/`;
  const gameFilesWithoutEnb = await getFilesWithoutEnb(
    gameFolderFilesDirectory
  );
  for (const file of gameFilesWithoutEnb) {
    await fs.promises.unlink(`${skyrimDirectory}/${file}`);
  }
}

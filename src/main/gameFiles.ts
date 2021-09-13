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
  const existingGameFilesWithoutEnb = gameFilesWithoutEnb.filter((file) =>
    fs.existsSync(`${skyrimDirectory}/${file}`)
  );
  for (const file of existingGameFilesWithoutEnb) {
    await fs.promises.unlink(`${skyrimDirectory}/${file}`);
  }
}

export async function checkGameFilesExist(
  modDirectory: string,
  skyrimDirectory: string
) {
  logger.info(`Checking which game files exist in ${skyrimDirectory}`);
  const gameFolderFilesDirectory = `${modDirectory}/Game Folder Files/`;
  const gameFilesWithoutEnb = await getFilesWithoutEnb(
    gameFolderFilesDirectory
  );
  const existingGameFilesWithoutEnb = gameFilesWithoutEnb.filter((file) =>
    fs.existsSync(`${skyrimDirectory}/${file}`)
  );
  return existingGameFilesWithoutEnb === gameFilesWithoutEnb;
}

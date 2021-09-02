import fs from "fs";
import { copy } from "fs-extra";
import { logger } from "@/main/logger";

export const enbFiles = [
  "enbseries.ini",
  "enblocal.ini",
  "enbseries",
  "d3d9.dll",
  "d3dx9_42.dll",
  "enbhost.exe",
];

export async function copyEnbFiles(
  modDirectory: string,
  skyrimDirectory: string
) {
  logger.info("Copying ENB Files");
  const gameFolderFilesDirectory = `${modDirectory}/Game Folder Files/`;
  const enbFilesWithoutEnbseries = enbFiles.filter(
    (file) => file !== "enbseries"
  );

  for (const file of enbFilesWithoutEnbseries) {
    await fs.promises.copyFile(
      `${gameFolderFilesDirectory}/${file}`,
      `${skyrimDirectory}/${file}`
    );
  }
  await copy(
    `${gameFolderFilesDirectory}/enbseries`,
    `${skyrimDirectory}/enbseries`
  );
}

export async function deleteEnbFiles(skyrimDirectory: string) {
  logger.info("Deleting ENB Files");

  const existingEnbFiles = enbFiles.filter((file) =>
    fs.existsSync(`${skyrimDirectory}/${file}`)
  );
  const enbFilesWithoutEnbseries = existingEnbFiles.filter(
    (file) => file !== "enbseries"
  );
  for (const file of enbFilesWithoutEnbseries) {
    await fs.promises.unlink(`${skyrimDirectory}/${file}`);
  }
  fs.rmdirSync(`${skyrimDirectory}/enbseries`, { recursive: true });
}

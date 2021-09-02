import fs from "fs";
import { logger } from "@/main/logger";

export const enbFiles = [
  "enbseries.ini",
  "enblocal.ini",
  "enbseries",
  "d3d9.dll",
  "d3dx9_42.dll",
  "enbhost.exe",
];

export async function deleteEnbFiles(skyrimDirectory: string) {
  logger.info("Deleting ENB Files");

  const existingEnbFiles = enbFiles.filter((file) =>
    fs.existsSync(`${skyrimDirectory}/${file}`)
  );
  const enbFilesWithoutEnbseries = existingEnbFiles.filter(
    (file) => file !== "enbseries"
  );
  enbFilesWithoutEnbseries.forEach((file) =>
    fs.promises.unlink(`${skyrimDirectory}/${file}`)
  );
  fs.rmdirSync(`${skyrimDirectory}/enbseries`, { recursive: true });
}

import { backupOriginalENBs, copyENBFiles, getENBPresets } from "@/main/ENB";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { backupOriginalProfiles, MO2EXE } from "@/main/modOrganizer";
import fs from "fs";
import { logger } from "@/main/logger";

export async function startupTasks() {
  await backupOriginalENBs();

  await backupOriginalProfiles();

  const ENBFiles =
    (userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE) as string) ||
    (await getENBPresets())[0].real;
  await copyENBFiles(ENBFiles, false);
}

export async function checkModpackPathIsValid(modpackPath: string) {
  return (
    [MO2EXE, "profiles", "launcher"]
      .filter((path) => !fs.existsSync(`${modpackPath}/${path}`))
      .map((path) => {
        logger.warn(
          `Selected mod directory "${modpackPath}" doesn't contain a "${path}" directory/file`
        );
        return path;
      }).length === 0
  );
}

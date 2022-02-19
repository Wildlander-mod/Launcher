import fs from "fs";
import { logger } from "@/main/logger";
import {
  backupDirectory,
  skyrimDirectory,
  USER_PREFERENCE_KEYS,
  userPreferences,
} from "@/main/config";
import { copy, existsSync } from "fs-extra";
import { not as isNotJunk } from "junk";
import { FriendlyDirectoryMap } from "@/modpack-metadata";

const ENBNameMappingFile = "namesENB.json";

const ENBDirectory = () =>
  `${userPreferences.get(
    USER_PREFERENCE_KEYS.MOD_DIRECTORY
  )}/launcher/ENB Presets`;

export const getENBPresets = async (): Promise<FriendlyDirectoryMap[]> => {
  const mappedENBs = JSON.parse(
    await fs.promises.readFile(
      `${userPreferences.get(
        USER_PREFERENCE_KEYS.MOD_DIRECTORY
      )}/launcher/${ENBNameMappingFile}`,
      "utf-8"
    )
  ) as FriendlyDirectoryMap[];

  const unmappedENBs = (
    await fs.promises.readdir(ENBDirectory(), { withFileTypes: true })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter(isNotJunk)
    .map((ENB): FriendlyDirectoryMap => ({ real: ENB, friendly: ENB }))
    // Remove any ENBs that have a mapping
    .filter(
      (unmappedENB) =>
        !mappedENBs.find(
          (mappedENB: FriendlyDirectoryMap) =>
            mappedENB.real === unmappedENB.real
        )
    );

  return [...mappedENBs, ...unmappedENBs];
};

export const backupOriginalENBs = async () => {
  const ENBBackupDirectory = `${backupDirectory()}/ENB Presets`;
  const backupExists = existsSync(ENBBackupDirectory);
  logger.debug(`Backup for ENBs exists: ${backupExists}`);

  if (!backupExists) {
    logger.info("No ENB backup exists. Backing up...");
    await fs.promises.mkdir(backupDirectory(), {
      recursive: true,
    });

    await copy(ENBDirectory(), ENBBackupDirectory);
  }
};

export const restoreENBPresets = async () => {
  logger.info("Restoring ENB presets");
  const ENBBackupDirectory = `${backupDirectory()}/ENB Presets`;
  await copy(ENBBackupDirectory, ENBDirectory(), { overwrite: true });
};

/**
 * Get all ENB files from all presets.
 * Different presets can have different files,
 * this will list all possible files.
 */
const getAllPossibleENBFiles = async () => {
  const files = [];
  for (const ENB of await getENBPresets()) {
    files.push(await fs.promises.readdir(`${ENBDirectory()}/${ENB.real}`));
  }
  // Flatten and remove duplicates
  return new Set([...files.flat().filter(isNotJunk)]);
};

const getExistingENBFiles = async () => {
  const ENBFiles = await getAllPossibleENBFiles();
  return (await fs.promises.readdir(skyrimDirectory())).filter((file) =>
    ENBFiles.has(file)
  );
};

const getENBFilesForPreset = async (preset: string) =>
  fs.promises.readdir(`${ENBDirectory()}/${preset}`);

/**
 * Deletes all ENB files from the Skyrim directory.
 * Different ENB presets will contain different files,
 * so all presets need to be read to ensure everything is removed
 */
export const deleteAllENBFiles = async () => {
  logger.info("Deleting ENB Files");

  const existingENBFiles = await getExistingENBFiles();

  for (const file of existingENBFiles) {
    const fileWithPath = `${skyrimDirectory()}/${file}`;
    logger.debug(`Deleting ENB file ${file} with path ${fileWithPath}`);
    const isDirectory = (await fs.promises.lstat(fileWithPath)).isDirectory();
    await fs.promises.rm(fileWithPath, { recursive: isDirectory });
  }
};

export const syncENBFromGameToPresets = async (preset: string | "noENB") => {
  logger.info(`Syncing ENB changes back to presets for ${preset}`);
  if (preset !== "noENB") {
    const enbFiles = await getENBFilesForPreset(preset);
    logger.debug(
      `ENB files that need to be synced: ${JSON.stringify(enbFiles)}`
    );

    for (const file of enbFiles) {
      const fileWithPath = `${skyrimDirectory()}/${file}`;
      const fileDestination = `${ENBDirectory()}/${preset}/${file}`;
      logger.debug(`Copying ${file} to ${fileDestination}`);
      if (existsSync(fileWithPath)) {
        await copy(fileWithPath, fileDestination, { overwrite: true });
      }
    }
  }

  logger.info("Finished syncing ENB presets");
};

/**
 * Copy all ENB files from an ENB preset
 * @param profile - Must be the actual ENB profile name, not the friendly name. noENB will remove all ENB files.
 * @param sync - Whether to sync the changes from Stock Game back to the ENB Preset directory
 */
export const copyENBFiles = async (profile: string | "noENB", sync = true) => {
  logger.info(`Copying ${profile} ENB Files prerequisite`);

  const previousProfile =
    (userPreferences.get(
      USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE
    ) as string) || "";
  if (sync && previousProfile && previousProfile !== "noENB") {
    // Sync the previous profile first so changes are not lost
    await syncENBFromGameToPresets(previousProfile);
  }

  await deleteAllENBFiles();

  logger.info(`Copying ${profile} ENB Files`);

  // All ENB files have been deleted already so nothing to do if the preset is noENB
  if (profile !== "noENB") {
    const ENBFiles = await getENBFilesForPreset(profile);

    for (const file of ENBFiles) {
      const fileWithPath = `${ENBDirectory()}/${profile}/${file}`;
      const fileDestination = `${skyrimDirectory()}/${file}`;
      logger.debug(
        `Copy ENB file ${file} with path ${fileWithPath} to ${fileDestination}`
      );
      await copy(fileWithPath, fileDestination);
    }
  }
};

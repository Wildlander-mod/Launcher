import fs from "fs";
import { https } from "follow-redirects";
import { logger } from "@/main/logger";
import { userPreferences, USER_PREFERENCE_KEYS } from "@/main/config";
import { existsSync } from "fs-extra";

export const netDesktopFileName = "windowsdesktop-runtime-6.0.1-win-x64.exe";
export const netConsoleFileName = "dotnet-runtime-5.0.13-win-x64.exe";
export const cLibFileName = "VC-redist.x64.exe";

const installFile = async (url: string, fileName: string) => {
  https.get(url, (res) => {
    const path = `${userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    )}/launcher/prereqs/${fileName}`;
    const fileStream = fs.createWriteStream(path);
    res.pipe(fileStream);

    fileStream.on("error", (err) => {
      logger.debug("Error: " + err);
    });

    fileStream.on("finish", () => {
      fileStream.close();
      logger.info(`Installed ${fileName} successfully`);
    });
  });
};

const installNETDesktop = async () => {
  await installFile(
    "https://download.visualstudio.microsoft.com/download/pr/bf058765-6f71-4971-aee1-15229d8bfb3e/c3366e6b74bec066487cd643f915274d/windowsdesktop-runtime-6.0.1-win-x64.exe",
    netDesktopFileName
  );
};

const installNETConsole = async () => {
  await installFile(
    "https://download.visualstudio.microsoft.com/download/pr/fccf43d2-3e62-4ede-b5a5-592a7ccded7b/6339f1fdfe3317df5b09adf65f0261ab/dotnet-runtime-5.0.13-win-x64.exe",
    netConsoleFileName
  );
};

const installCLib = async () => {
  await installFile(
    "https://aka.ms/vs/17/release/vc_redist.x64.exe",
    cLibFileName
  );
};

const createPrereqsDir = async () => {
  const prereqsPath =
    userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY) +
    "/launcher/prereqs";
  if (!fs.existsSync(prereqsPath)) {
    logger.info("Creating prereqs directory");
    await fs.promises.mkdir(prereqsPath);
  }
};

export const prereqExists = (fileName: string) => {
  return existsSync(
    `${userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    )}/launcher/prereqs/${fileName}`
  );
};

export const installMissingPrereqs = async (): Promise<boolean> => {
  createPrereqsDir();
  if (!prereqExists(netDesktopFileName)) {
    logger.info("Installing .NET Desktop framework");
    await installNETDesktop();
  } else {
    logger.info(".NET Desktop framework is already installed");
  }
  if (!prereqExists(netConsoleFileName)) {
    logger.info("Installing .NET Console framework");
    await installNETConsole();
  } else {
    logger.info(".NET Console framework is already installed");
  }
  if (!prereqExists(cLibFileName)) {
    logger.info("Installing Microsoft C++ visual library");
    await installCLib();
  } else {
    logger.info("Microsoft C++ visual library already installed");
  }
  return true;
};

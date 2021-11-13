import { getResourcePath } from "@/main/resources";
import { execFile } from "child_process";
import { logger } from "@/main/logger";
import fs from "fs";
import extract from "extract-zip";

import { resolve } from "path";

const getWabbajackDirectory = () => `${getResourcePath()}/wabbajack`;

const extractWabbajack = async () => {
  await extract(`${getWabbajackDirectory()}/Wabbajack.zip`, {
    dir: resolve(getWabbajackDirectory()),
  });
};

export const runWabbajack = async () => {
  logger.info("Running Wabbajack");

  if (!fs.existsSync(`${getWabbajackDirectory()}/Wabbajack.exe`)) {
    logger.debug("Wabbajack hasn't been extracted yet, extracting...");
    await extractWabbajack();
    logger.debug("Wabbajack successfully extracted");
  }

  logger.debug("Executing Wabbajack.exe");

  execFile(
    `Wabbajack.exe`,
    { cwd: getWabbajackDirectory() },
    (error, stdout, stderr) => {
      if (error) {
        logger.error(error);
        logger.error(`Wabbajack stderr: ${stderr}`);
        throw new Error("Error running Wabbajack");
      }
      logger.debug(`Wabbajack logs: ${stderr}`);
    }
  );
};

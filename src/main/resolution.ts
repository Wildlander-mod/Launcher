import * as os from "os";
import { promisify } from "util";
import childProcess from "child_process";
import { logger } from "@/main/logger";
import {
  modDirectory,
  modpack,
  USER_PREFERENCE_KEYS,
  userPreferences,
} from "@/main/config";
import { parse, stringify } from "js-ini";
import fs from "fs";
import { IIniObjectSection } from "js-ini/src/interfaces/ini-object-section";
import { getResourcePath } from "@/main/resources";

export interface Resolution {
  height: number;
  width: number;
}

let resolutionsCache: Resolution[];

export const getResolutions = async (): Promise<Resolution[]> => {
  logger.info("Getting resolutions");

  if (resolutionsCache) {
    logger.debug(`Resolutions cached ${JSON.stringify(resolutionsCache)}`);
    return resolutionsCache;
  }

  // The application is only supported on Windows machines.
  // However, development is supported on other OSs so just return some mock values
  if (os.platform() !== "win32") {
    return [
      {
        width: 3080,
        height: 2040,
      },
      {
        width: 1980,
        height: 1080,
      },
    ];
  } else {
    const { stdout: resolutionOutput, stderr } = await promisify(
      childProcess.exec
    )(`"${getResourcePath()}/tools/QRes.exe" /L`);
    if (stderr) {
      logger.error(`Error getting resolutions ${stderr}`);
      throw new Error(stderr);
    }

    /**
     * The above command outputs resolutions in the format:
     * 640x480, 32 bits @ 60 Hz.
     * 720x480, 32 bits @ 60 Hz.
     */

    const resolutions = resolutionOutput
      .split(/\r*\n/)
      // The first 2 items in the array will contain copyright and version information
      .slice(2)
      // Remove empty entries
      .filter((resolution) => resolution !== "")
      // Only save the resolution
      .map((resolution) => resolution.split(",")[0]);

    // Remove duplicates
    const uniqueResolutions = [...new Set(resolutions)]
      // Save the height and width separately
      .map((resolution) => ({
        width: Number(resolution.split("x")[0]),
        height: Number(resolution.split("x")[1]),
      }))
      .sort((resolution, previousResolution) =>
        resolution.width > previousResolution.width ? -1 : 1
      );

    logger.debug(`Resolutions: ${JSON.stringify(uniqueResolutions)}`);

    resolutionsCache = uniqueResolutions;

    return uniqueResolutions;
  }
};

const skyrimGraphicsSettingsPath = () =>
  `${modDirectory()}/mods/${modpack.name}/SKSE/Plugins/SSEDisplayTweaks.ini`;

export const setResolution = async () => {
  const widthPreference = userPreferences.get(USER_PREFERENCE_KEYS.WIDTH);
  const heightPreference = userPreferences.get(USER_PREFERENCE_KEYS.HEIGHT);

  // Only change the resolution in the ini if it has been set in the launcher
  if (widthPreference && heightPreference) {
    logger.info(
      `Setting resolution to ${widthPreference} x ${heightPreference}`
    );
    const SkyrimGraphicSettings = parse(
      await fs.promises.readFile(skyrimGraphicsSettingsPath(), "utf-8"),
      { comment: "#" }
    ) as IIniObjectSection;

    (
      SkyrimGraphicSettings.Render as IIniObjectSection
    ).Resolution = `${widthPreference}x${heightPreference}`;

    await fs.promises.writeFile(
      skyrimGraphicsSettingsPath(),
      stringify(SkyrimGraphicSettings)
    );
  }
};

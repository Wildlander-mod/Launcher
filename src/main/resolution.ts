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
import { screen } from "electron";

export interface Resolution {
  height: number;
  width: number;
}

let resolutionsCache: Resolution[];

export const isUnsupportedResolution = (width: number, height: number) =>
  // Anything above this is an unsupported resolution. Most 16:9 resolutions are 1.7777777777777777.
  // There are some legacy resolutions that aren't quite 16:9.
  width / height > 1.78;

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
        width: 5120,
        height: 1440,
      },
      {
        width: 3080,
        height: 2040,
      },
      {
        width: 1920,
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
      .sort((resolution, previousResolution) => {
        return (
          previousResolution.width - resolution.width ||
          previousResolution.height - resolution.height
        );
      });

    logger.debug(
      `Resolutions: ${uniqueResolutions.map(
        ({ width, height }) => `${width}x${height}`
      )}`
    );

    resolutionsCache = uniqueResolutions;

    return uniqueResolutions;
  }
};

const skyrimGraphicsSettingsPath = () =>
  `${modDirectory()}/mods/${modpack.name}/SKSE/Plugins/SSEDisplayTweaks.ini`;

export const setResolution = async () => {
  const { width: widthPreference, height: heightPreference } =
    userPreferences.get(USER_PREFERENCE_KEYS.RESOLUTION) as Resolution;

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

    const {
      size: { width, height },
      scaleFactor,
    } = screen.getPrimaryDisplay();

    const borderlessUpscale = !isUnsupportedResolution(
      width * scaleFactor,
      height * scaleFactor
    );

    logger.debug(
      `Enabling borderless upscale for ${width * scaleFactor}x${
        height * scaleFactor
      }: ${borderlessUpscale}`
    );

    // If the selected resolution is ultra-widescreen, don't upscale the image otherwise it gets stretched
    (SkyrimGraphicSettings.Render as IIniObjectSection).BorderlessUpscale =
      borderlessUpscale;

    await fs.promises.writeFile(
      skyrimGraphicsSettingsPath(),
      stringify(SkyrimGraphicSettings)
    );
  }
};

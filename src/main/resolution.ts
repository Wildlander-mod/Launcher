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

const getCurrentResolution = (): Resolution => {
  const {
    size: { height, width },
    scaleFactor,
  } = screen.getPrimaryDisplay();
  return {
    width: width * scaleFactor,
    height: height * scaleFactor,
  };
};

const getSupportedResolutions = async () => {
  const { stdout: resolutionOutput, stderr } = await promisify(
    childProcess.exec
  )(`"${getResourcePath()}/tools/QRes.exe" /L`);
  if (stderr) {
    logger.error(`Error getting resolutions ${stderr}`);
    throw new Error(stderr);
  }

  return (
    resolutionOutput
      /**
       * QRes.exe outputs resolutions in the format:
       * 640x480, 32 bits @ 60 Hz.
       * 720x480, 32 bits @ 60 Hz.
       */
      .split(/\r*\n/)
      // The first 2 items in the array will contain copyright and version information
      .slice(2)
      // Remove empty entries
      .filter((resolution) => resolution !== "")
      // Only save the resolution
      .map((resolution) => resolution.split(",")[0])
  );
};

const sortResolutions = (
  resolution: Resolution,
  previousResolution: Resolution
) =>
  previousResolution.width - resolution.width ||
  previousResolution.height - resolution.height;

const resolutionsContainCurrent = (
  resolutions: Resolution[],
  current: Resolution
) =>
  resolutions.some(
    ({ width, height }) => current.height === height && current.width === width
  );

export const getResolutions = async (): Promise<Resolution[]> => {
  logger.info("Getting resolutions");

  if (resolutionsCache) {
    logger.debug(`Resolutions cached ${JSON.stringify(resolutionsCache)}`);
    return resolutionsCache;
  }

  const currentResolution = getCurrentResolution();

  // The application is only supported on Windows machines.
  // However, development is supported on other OSs so just return the current resolution
  if (os.platform() !== "win32") {
    return [currentResolution];
  } else {
    const resolutions = [...new Set(await getSupportedResolutions())]
      // Format the QRes output
      .map((resolution) => ({
        width: Number(resolution.split("x")[0]),
        height: Number(resolution.split("x")[1]),
      }));

    logger.debug(`Supported resolutions: ${JSON.stringify(resolutions)}`);

    // Sometimes, QRes.exe cannot recognise some resolutions.
    // As a safety measure, add the users current resolution if it wasn't detected.
    if (!resolutionsContainCurrent(resolutions, currentResolution)) {
      logger.debug(
        `Native resolution (${currentResolution}) not found. Adding to the list.`
      );
      resolutions.push(currentResolution);
    }

    const sortedResolutions = resolutions.sort(sortResolutions);

    logger.debug(
      `Resolutions: ${sortedResolutions.map(
        ({ width, height }) => `${width}x${height}`
      )}`
    );

    // Add resolutions to a cache to computing them later
    resolutionsCache = sortedResolutions;

    return sortedResolutions;
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

    const { scaleFactor } = screen.getPrimaryDisplay();
    const { width, height } = getCurrentResolution();

    const borderlessUpscale = !isUnsupportedResolution(width, height);

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

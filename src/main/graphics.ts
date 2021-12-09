import * as os from "os";
import { promisify } from "util";
import childProcess from "child_process";
import { logger } from "@/main/logger";
import {
  modDirectory,
  USER_PREFERENCE_KEYS,
  userPreferences,
} from "@/main/config";
import { parse, stringify } from "js-ini";
import fs from "fs";
import { IIniObjectSection } from "js-ini/src/interfaces/ini-object-section";

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
    )(
      "wmic /namespace:\\\\root\\wmi path wmimonitorlistedsupportedsourcemodes  get * /format:list | findstr ActivePixels"
    );
    if (stderr) {
      logger.error(`Error getting resolutions ${stderr}`);
      throw new Error(stderr);
    }

    /** The output of the above command for each resolution is
     * HorizontalActivePixels=1920
     * VerticalActivePixels=1080
     */

    const resolutions = resolutionOutput
      .split(/\r*\n/)
      .filter((resolution) => resolution !== "")
      .reduce<Resolution[]>(
        (previous, current, index) => {
          // The output of the resolution command returns the width on one line and height on the next.
          // The heights and widths need to be combined so every second item,
          // add the height to the previous height
          if (index % 2 === 0) {
            return [
              ...previous,
              {
                width: Number(current.split("HorizontalActivePixels=")[1]),
                // Add a null height so that TypeScript doesn't complain.
                // This is about to be overridden anyway. TypeScript struggles here
                // because the data from Windows is not good
                height: 0,
              },
            ];
          } else {
            const previousResolution = previous.pop();
            return [
              ...previous,
              {
                height: Number(current.split("VerticalActivePixels=")[1]),
                width: (previousResolution as Resolution).width,
              },
            ];
          }
        },
        [{ height: 0, width: 0 }]
      )
      // Remove empty entries
      .filter((resolution) => resolution.height !== 0)
      // Remove duplicates
      .filter(
        (currentResolution, index, self) =>
          index ===
          self.findIndex(
            (comparedResolution) =>
              comparedResolution.height === currentResolution.height &&
              comparedResolution.width === currentResolution.width
          )
      )
      .sort((resolution, previousResolution) =>
        (resolution as Resolution).width >
        (previousResolution as Resolution).width
          ? -1
          : 1
      );

    logger.debug(
      `Found resolutions: ${resolutions.map(
        ({ width, height }) => `${width} x ${height}`
      )}`
    );

    resolutionsCache = resolutions;

    return resolutions;
  }
};

const skyrimGraphicsSettingsPath = () =>
  `${modDirectory()}/mods/UltSky/SKSE/Plugins/SSEDisplayTweaks.ini`;

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

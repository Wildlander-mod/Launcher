/**
 * Handles interaction with configuration file
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @module
 * @throws B01-02-00
 * @throws B01-02-01
 * @throws B01-02-02
 * @throws B01-02-03
 * @throws B01-03-00
 * @throws B01-04-00
 * @requires path
 * @requires fs
 * @requires os
 */

import path from "path";
import fs from "fs";
import os from "os";
import { currentLogPath, toLog } from "./log.js";
import { sendError, fatalError } from "./errorHandler.js";

/**
 * Location of config file and logs
 * @type {string}
 */
const homeDirectory = path.join(os.homedir(), "Ultimate Skyrim Launcher");
/**
 * Location of config file
 * @type {string}
 */
const configPath = path.join(homeDirectory, "/options.json");
/**
 * Default configuration settings
 * @type {object}
 */
const defaultConfig = require("../json/defaultConfig.json");
/**
 * Location of app installation
 * @type {string}
 */
const appPath = process.argv[0];
/**
 * Development mode
 * @type {boolean}
 */
export const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Intitialize home directory, configuration file, and log.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @returns {null} For async functionality
 * @throws B01-02-00
 * @throws B01-02-01
 * @throws B01-02-02
 * @throws B01-02-03
 */
export async function initializeConfiguration() {
  try {
    if (!fs.existsSync(homeDirectory)) {
      fs.mkdir(homeDirectory, err => {
        if (err) {
          fatalError("B01-02-01", "Error while creating home directory!", err);
          return;
        }
        if (!fs.existsSync(path.join(homeDirectory, "logs"))) {
          fs.mkdirSync(path.join(homeDirectory, "logs"), err => {
            if (err) {
              fatalError(
                "B01-02-02",
                "Error while creating logs directory!",
                err
              );
            }
          });
        }
      });
    }

    // Log initialization
    fs.writeFile(currentLogPath, "LOG BEGIN", err => {
      if (err) {
        sendError("B01-02-03", "Error while creating new log", err);
        return;
      }
      toLog("Launcher version " + defaultConfig.version, 0);
      toLog("Home Directory path: " + homeDirectory, 0);
      toLog("Starting...\n" + "=".repeat(80), 0);
      toLog("Checking for configuration file", 1);

      // Configuration initialization
      let oldConfig = {};
      if (!fs.existsSync(configPath)) {
        toLog("Not found! Creating file at " + configPath, 2);
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        oldConfig = defaultConfig;
      } else {
        toLog("File found at " + configPath, 2);
        oldConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
      if (oldConfig.version !== defaultConfig.version) {
        toLog(
          "Updating config version from " +
            oldConfig.version +
            " to " +
            defaultConfig.version,
          2
        );
        oldConfig.version = defaultConfig.version;
      }
      oldConfig.ModDirectory = appPath;
      oldConfig.isDevelopment = isDevelopment;
      oldConfig = JSON.stringify(oldConfig, null, 2);
      toLog("Configuration:\n" + oldConfig, 2);
      fs.writeFileSync(configPath, oldConfig);
    });
  } catch (err) {
    fatalError("B01-02-00", "Error while initializing configuration!", err);
  }
}
/**
 * Retrieves current config.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @param {Number} tabbed
 * @returns {JSON} App configuration
 * @throws B01-03-00
 */
export function getConfig(tabbed) {
  try {
    toLog("Reading config", tabbed);
    return JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));
  } catch (err) {
    sendError("B01-03-00", "Error while retrieving config!", err, tabbed);
    return "ERROR";
  }
}
/**
 * Saves newConfig to config file.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @param {JSON} newConfig
 * @param {Number} tabbed
 * @throws B01-04-00
 */
export function saveConfig(newConfig, tabbed) {
  try {
    newConfig = JSON.stringify(newConfig, null, 2);
    toLog("Saving config", tabbed);
    toLog("New Configuration:\n" + newConfig, tabbed);
    fs.writeFileSync(configPath, newConfig);
  } catch (err) {
    sendError("B01-04-00", "Error while saving config!", err, tabbed);
  }
}
/**
 * Resets config file to default.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @throws B01-05-00
 */
export function resetConfig() {
  try {
    saveConfig(defaultConfig, 1);
    const newConfig = getConfig(1);
    if (newConfig === "ERROR") return "ERROR";
    newConfig.ModDirectory = appPath;
    newConfig.isDevelopment = isDevelopment;
    saveConfig(newConfig, 1);
    return true;
  } catch (err) {
    sendError("B01-05-00", "Error while resetting config", err, 0);
  }
}

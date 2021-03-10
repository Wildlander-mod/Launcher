import path from "path";
import fs from "fs";
import os from "os";
import { getCurrentLogPath, toLog } from "./log";
import { fatalError, sendError } from "./errorHandler";
import defaultConfig from "../json/defaultConfig.json";

interface Config {
  Options: {
    GameDirectory: string;
    ModDirectory: string;
    DefaultPreset: string;
  };
  ENB: {
    CurrentENB: string;
    Profiles: {
      "Ultimate Skyrim": {
        name: string;
        path: string;
      };
    };
  };
  version: string;
  isDevelopment?: boolean;
}

export const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Location of config file and logs
 */
const homeDirectory = path.join(os.homedir(), "Ultimate Skyrim Launcher");
const configPath = path.join(homeDirectory, "/options.json");
const appInstallPath = process.argv[0];

export async function initializeConfiguration() {
  try {
    if (!fs.existsSync(homeDirectory)) {
      fs.mkdir(homeDirectory, err => {
        if (err) {
          fatalError(
            "B01-02-01",
            "Error while creating home directory!",
            err.message
          );
          return;
        }
        if (!fs.existsSync(path.join(homeDirectory, "logs"))) {
          fs.mkdirSync(path.join(homeDirectory, "logs"));
        }
      });
    }

    // Log initialization
    fs.writeFile(getCurrentLogPath(), "LOG BEGIN", err => {
      if (err) {
        sendError("B01-02-03", "Error while creating new log", err.message);
        return;
      }
      toLog("Launcher version " + defaultConfig.version);
      toLog("Home Directory path: " + homeDirectory);
      toLog("Starting...\n" + "=".repeat(80));
      toLog("Checking for configuration file");

      // Configuration initialization
      let oldConfig;
      if (!fs.existsSync(configPath)) {
        toLog("Not found! Creating file at " + configPath);
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        oldConfig = defaultConfig;
      } else {
        toLog("File found at " + configPath);
        oldConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
      if (oldConfig.version !== defaultConfig.version) {
        toLog(
          "Updating config version from " +
            oldConfig.version +
            " to " +
            defaultConfig.version
        );
        oldConfig.version = defaultConfig.version;
      }
      oldConfig.ModDirectory = appInstallPath;
      oldConfig.isDevelopment = isDevelopment;
      oldConfig = JSON.stringify(oldConfig, null, 2);
      toLog("Configuration:\n" + oldConfig);
      fs.writeFileSync(configPath, oldConfig);
    });
  } catch (err) {
    fatalError("B01-02-00", "Error while initializing configuration!", err);
  }
}

export function getConfig(): Config {
  try {
    toLog("Reading config");
    return JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));
  } catch (err) {
    const errorMessage = "Error while retrieving config";
    sendError("B01-03-00", errorMessage, err);
    throw new Error(errorMessage);
  }
}

export function saveCurrentConfig(newConfig: Config) {
  try {
    toLog("Saving config");
    toLog("New Configuration:\n" + JSON.stringify(newConfig, null, 2));
    fs.writeFileSync(configPath, JSON.stringify(newConfig));
  } catch (err) {
    sendError("B01-04-00", "Error while saving config", err);
  }
}

export function resetConfig() {
  try {
    saveCurrentConfig(defaultConfig);
    const newConfig = getConfig();
    newConfig.Options.ModDirectory = appInstallPath;
    newConfig.isDevelopment = isDevelopment;
    saveCurrentConfig(newConfig);
    return true;
  } catch (err) {
    sendError("B01-05-00", "Error while resetting config", err);
  }
}

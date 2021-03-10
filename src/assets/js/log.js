/**
 * Handles logging
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @module
 * @throws B05-01-00
 * @requires electron
 * @requires path
 * @requires fs
 * @requires os
 */
import { shell } from "electron";
import path from "path";
import fs from "fs";
import os from "os";
import { sendError } from "./errorHandler";

/**
 * Location of config file and logs
 * @type {String}
 */
const homeDirectory = path.join(os.homedir(), "Ultimate Skyrim Launcher");
/**
 * Logging enabled
 * @type {Boolean}
 */
let logging = true;

/**
 * @ignore
 */
function getCurrentTime() {
  const date = new Date();
  const time = [date.getHours(), date.getMinutes(), date.getSeconds()];
  time.forEach((entry, index) => {
    if (entry < 10) {
      time[index] = "0" + entry.toString();
    } else {
      time[index] = entry.toString();
    }
  });
  return time[0] + ":" + time[1] + ":" + time[2];
}

/**
 * @ignore
 */
function getCurrentDate() {
  const date = new Date();
  const time = getCurrentTime();
  const currentDate = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    time.replace(/:/g, "-")
  ];
  currentDate.forEach((entry, index) => {
    if (entry < 10) {
      currentDate[index] = "0" + entry.toString();
    } else {
      currentDate[index] = entry.toString();
    }
  });
  return (
    currentDate[0] +
    "-" +
    currentDate[1] +
    "-" +
    currentDate[2] +
    "-" +
    currentDate[3]
  );
}

/**
 * Path to current log file
 * @type {String}
 */
export const currentLogPath = path.join(
  homeDirectory,
  "/logs/",
  getCurrentDate() + ".txt"
);

/**
 * Appends param 'log' to current log file
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @param {String} log
 * @param {Number} tabbed
 * @throws B05-01-00
 */
export function toLog(log, tabbed) {
  if (logging) {
    const logged =
      "\n" + getCurrentTime() + "  -  " + "  ".repeat(tabbed) + log;
    fs.appendFile(currentLogPath, logged, err => {
      if (err) {
        logging = false;
        sendError(
          "B05-01-00",
          "Error while writing to log! Logging has been disabled.",
          err,
          tabbed
        );
      }
    });
  }
}

/**
 * Opens path to log folder
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 */
export function openLog() {
  shell.openPath(currentLogPath);
}

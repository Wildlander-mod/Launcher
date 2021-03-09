/**
 * Handles errors
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @module
 * @throws B02-01-00
 * @requires electron
 */

import { app, dialog } from "electron";
import { toLog } from "./log.js";
import { getWebContents } from "./ipcHandler.js";

/**
 * Sends errors to front-end error modal and log.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @fires webContents#error
 * @param {string} code
 * @param {string} message
 * @param {Error} err
 * @param {Number} tabbed
 * @throws B02-01-00
 */
export function sendError(code, message, err, tabbed) {
  toLog(message + "\n" + "Error code: " + code + "\n\n" + err + "\n\n", tabbed);
  try {
    /**
     * Sends error to front-end
     * @event webContents#error
     */
    getWebContents().send("error", { code: code, message: message, err: err });
  } catch (e) {
    toLog(
      "Error not sent to front end. WebContents is most likely not defined.\nError code: B02-01-00\n\n" +
        e +
        "\n\n",
      tabbed
    );
  }
}

/**
 * Shows error dialog and quits app on fatal error.
 * @author RingComics <thomasblasquez@gmail.com>
 * @param {string} code
 * @param {string} message
 * @param {Error} err
 * @param {Number} tabbed
 */
export function fatalError(code, message, err) {
  dialog.showMessageBoxSync(
    {
      type: "error",
      title: "A fatal error occured! " + code,
      message: message + "\n" + err,
    },
    () => {
      toLog(
        "\n\n" +
          "=".repeat(10) +
          "A FATAL ERROR OCCURED" +
          "=".repeat(10) +
          message +
          "\n\n" +
          err +
          "\n\nEXITING ULTIMATE SKYRIM LAUNCHER."
      );
      app.quit();
    }
  );
}

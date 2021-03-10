import { app, dialog } from "electron";
import { toLog } from "./log";
import { getWebContents } from "./ipcHandler";

/**
 * Sends errors to front-end error modal and log.
 */
export function sendError(
  code: string,
  message: string,
  err: string,
  writeLog = true
) {
  if (writeLog) {
    toLog(`${code} - ${message} - ${err}`);
  }
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
        "\n\n"
    );
  }
}

/**
 * Shows error dialog and quits app on fatal error.
 */
export function fatalError(code: string, message: string, err: string) {
  toLog(`
    ${"=".repeat(10)}
    A FATAL ERROR OCCURRED
    ${"=".repeat(10)}
    ${message}
    ${err}
    EXITING ULTIMATE SKYRIM LAUNCHER
  `);

  dialog.showMessageBoxSync({
    type: "error",
    title: "A fatal error occured! " + code,
    message: message + "\n" + err
  });
  app.quit();
}

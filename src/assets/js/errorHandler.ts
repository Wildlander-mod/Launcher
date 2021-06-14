import { app, dialog } from "electron";
import { toLog } from "./log";

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
    title: "A fatal error occurred! " + code,
    message: message + "\n" + err
  });
  app.quit();
}

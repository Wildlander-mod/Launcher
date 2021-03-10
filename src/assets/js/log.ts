import { shell } from "electron";
import path from "path";
import fs from "fs";
import os from "os";
import { sendError } from "./errorHandler";

const logDirectory = path.join(
  os.homedir(),
  "Ultimate Skyrim Launcher",
  "logs"
);

export const getCurrentLogPath = () =>
  path.join(
    logDirectory,
    new Date().toLocaleDateString().replace("/", "-") + ".txt"
  );

// Log to the default log path
export function toLog(log: string) {
  const logged = `\n ${new Date().toLocaleTimeString()} - ${log}`;
  fs.appendFile(getCurrentLogPath(), logged, err => {
    if (err) {
      sendError(
        "B05-01-00",
        "Error while writing to log! Logging has been disabled.",
        err.message,
        false
      );
    }
  });
}

export async function openLogDirectory() {
  await shell.openPath(getCurrentLogPath());
}

import { shell } from "electron";
import path from "path";
import fs from "fs";
import os from "os";
import { isDevelopment } from "@/main/config";

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
  console.debug(log);
  if (!isDevelopment) {
    fs.appendFile(
      getCurrentLogPath(),
      `\n ${new Date().toLocaleTimeString()} - ${log}`,
      err => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
}

export async function openLogDirectory() {
  await shell.openPath(getCurrentLogPath());
}

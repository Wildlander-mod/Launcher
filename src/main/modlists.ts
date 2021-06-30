import path from "path";
import childProcess from "child_process";
import { toLog } from "./log";
import { sendError } from "./errorHandler";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";

export function launchGame() {
  try {
    toLog("Launching game");
    toLog(`User configuration: ${JSON.stringify(userPreferences.store)}`);
    const modlistPath = userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
    const MO2Path = path.join(modlistPath, "/ModOrganizer.exe");
    const MO2exe = "SKSE";
    const profile = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);

    toLog("Starting MO2");
    const execCMD = `"${MO2Path}" -p "${profile}" "moshortcut://:${MO2exe}"`;
    childProcess.exec(execCMD, error => {
      if (error) {
        sendError("", "Error while executing ModOrganizer", error.message);
      }
    });
  } catch (err) {
    sendError("", "Error while launching modlist", err);
  }
}

import path from "path";
import fs from "fs";
import childProcess from "child_process";
import ncp from "ncp";
import { toLog } from "./log";
import { sendError } from "./errorHandler";
import { getWebContents, getWindow } from "./ipcHandler";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";

export function launchGame() {
  try {
    toLog("Launching game..." + "\n" + "=".repeat(80));
    const currentConfig = userPreferences;
    const modlistPath = currentConfig.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
    toLog("Path: " + modlistPath);
    const exe = "SKSE";
    toLog("Executable: " + exe);
    const profile = currentConfig.get(USER_PREFERENCE_KEYS.PRESET);
    toLog("MO2 Profile: " + profile);
    const gamePath = currentConfig.get(USER_PREFERENCE_KEYS.GAME_DIRECTORY);
    toLog("Game Path: " + gamePath);
    toLog("Moving Game Folder Files");
    toLog("GFF:");
    const gffArray = fs.readdirSync(
      path.join(modlistPath, "Game Folder Files")
    );
    gffArray.forEach(file => {
      toLog(file);
    });
    ncp.ncp(path.join(modlistPath, "Game Folder Files"), gamePath, errors => {
      if (errors) {
        getWebContents().send("game-closed");
        errors.forEach(error =>
          sendError(
            "B06-03-01",
            "Error while moving Game Folder Files",
            error.message
          )
        );
      }
    });
    toLog("Starting MO2");
    const execCMD =
      '"' +
      modlistPath +
      '\\ModOrganizer.exe" -p "' +
      profile +
      '" "moshortcut://:' +
      exe +
      '"';
    childProcess.exec(execCMD, error => {
      if (error) {
        getWebContents().send("game-closed");
        sendError(
          "B06-03-02",
          "Error while executing ModOrganizer!",
          error.message
        );
      }
    });

    const isRunning = (program: string, check: (status: boolean) => void) => {
      childProcess.exec("tasklist", (err, stdout) => {
        if (err) throw err;
        check(stdout.toLowerCase().indexOf(program.toLowerCase()) > -1);
      });
    };

    const isGameRunning = setInterval(() => {
      isRunning("ModOrganizer.exe", status => {
        if (!status) {
          toLog("GAME CLOSED");
          clearInterval(isGameRunning);
          toLog("Removing Game Folder Files");
          fs.readdir(
            path.join(modlistPath, "Game Folder Files"),
            (err, files) => {
              if (err) throw err;
              files.forEach(file => {
                toLog("Removing " + file);
                fs.unlink(path.join(gamePath, file), error => {
                  if (error) {
                    throw new Error(
                      `Failed to unlink ${path.join(gamePath, file)}`
                    );
                  }
                });
                fs.rmdir(path.join(gamePath, file), error => {
                  if (error) {
                    throw new Error(
                      `Failed to remove directory ${path.join(gamePath, file)}`
                    );
                  }
                });
              });
              getWindow().show();
              getWebContents().send("game-closed");
              toLog("Done!\n" + "=".repeat(80) + "\n");
            }
          );
        }
      });
    }, 1000);
  } catch (err) {
    getWebContents().send("game-closed");
    sendError("B06-03-00", "Error while launching modlist", err);
  }
}

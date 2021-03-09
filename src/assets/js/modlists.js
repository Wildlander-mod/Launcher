/**
 * Handles modlist interactions.
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @module
 */

import path from "path";
import fs from "fs";
import childProcess from "child_process";
import ncp from "ncp";
import { getConfig } from "./config.js";
import { toLog } from "./log.js";
import { sendError } from "./errorHandler.js";
import { getWebContents, getWindow } from "./ipcHandler";

/**
 * Launches modlist
 * @author RingComics <thomasblasquez@gmail.com>
 * @version 1.0.0
 * @param {String} list
 * @emits game-closed
 */
export function launchGame() {
  try {
    toLog("Launching game..." + "\n" + "=".repeat(80), 0);
    const currentConfig = getConfig(1);
    if (currentConfig === "ERROR") return getWebContents().send("game-closed");
    const modlistPath = currentConfig.ModDirectory;
    toLog("Path: " + modlistPath, 2);
    const exe = "SKSE";
    toLog("Executable: " + exe, 2);
    const profile = currentConfig.DefaultPreset;
    toLog("MO2 Profile: " + profile, 2);
    const gamePath = currentConfig.GameDirectory;
    toLog("Game Path: " + gamePath, 2);
    toLog("Moving Game Folder Files", 1);
    toLog("GFF:", 2);
    const gffArray = fs.readdirSync(
      path.join(modlistPath, "Game Folder Files")
    );
    gffArray.forEach((file) => {
      toLog(file, 3);
    });
    ncp.ncp(path.join(modlistPath, "Game Folder Files"), gamePath, (err) => {
      if (err) {
        getWebContents().send("game-closed");
        sendError("B06-03-01", "Error while moving Game Folder Files", err, 2);
      }
    });
    toLog("Starting MO2", 1);
    const execCMD =
      '"' +
      modlistPath +
      '\\ModOrganizer.exe" -p "' +
      profile +
      '" "moshortcut://:' +
      exe +
      '"';
    childProcess.exec(execCMD, (error) => {
      if (error) {
        getWebContents().send("game-closed");
        sendError("B06-03-02", "Error while executing ModOrganizer!", error, 2);
      }
    });
    /**
     * Checks if queried program is still running
     * @param {String} query
     * @param {Function} cb
     */
    const isRunning = (query, check) => {
      childProcess.exec("tasklist", (err, stdout, stderr) => {
        if (err) throw err;
        check(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
      });
    };
    const isGameRunning = setInterval(() => {
      isRunning("ModOrganizer.exe", (status) => {
        if (!status) {
          toLog("GAME CLOSED", 1);
          clearInterval(isGameRunning);
          toLog("Removing Game Folder Files", 2);
          fs.readdir(
            path.join(modlistPath, "Game Folder Files"),
            (err, files) => {
              if (err) throw err;
              files.forEach((file) => {
                toLog("Removing " + file, 3);
                fs.unlink(path.join(gamePath, file));
                fs.rmdir(path.join(gamePath, file), { recursive: true });
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

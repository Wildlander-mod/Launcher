"use strict";

// Import modules
import { app, BrowserWindow, nativeImage, protocol } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import { initializeConfiguration, isDevelopment } from "./assets/js/config";
import { toLog } from "./assets/js/log";
import { fatalError } from "./assets/js/errorHandler";
import { setWindow } from "./assets/js/ipcHandler";

// Electron __static is global to electron apps but there is no type definition for it
declare const __static: string;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  try {
    const win = new BrowserWindow({
      frame: false,
      height: 580,
      // TODO this shouldn't allow undefined. In electron __static is undefined
      // eslint-disable-next-line no-undef
      icon: nativeImage.createFromPath(path.join(__static, "icon.ico")),
      maximizable: false,
      resizable: false,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean
      },
      width: 1000
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
      if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
      createProtocol("app");
      // Load the index.html when not in development
      win.loadURL("app://./index.html");
    }
    setWindow(win);
  } catch (err) {
    fatalError("B00-01-00", "Error while creating BrowserWindow", err);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  initializeConfiguration().then(() => {
    toLog("Creating window.");
    createWindow();

    toLog("App started!\n" + "=".repeat(80) + "\n");
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

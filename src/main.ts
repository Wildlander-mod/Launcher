import { app, dialog, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log/main";
import { LauncherApplication } from "./main/application";
import { ErrorService } from "./main/services/error.service";
import { WindowService } from "./main/services/window.service";
import type { ProcessWithGlobals } from "./main/types/process-globals";
import { promisify } from "util";

if (process.env["MULTIPLE_INSTANCE"] !== "true") {
  const isSingleInstance = app.requestSingleInstanceLock();
  if (!isSingleInstance) {
    log.debug("Secondary instance opened, quitting");
    app.quit();
  }
}

// Ensure it's easy to tell where the logs for this application start
const initialLog = `|             ${new Date().toLocaleString()}             |`;
log.debug("-".repeat(initialLog.length));
log.debug(initialLog);
log.debug("-".repeat(initialLog.length));
autoUpdater.logger = log;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

// Exit cleanly on request from parent process in development mode.
if (!app.isPackaged) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }

  if (process.platform !== "win32") {
    if (!process.env["APPDATA"]) {
      // The application requires a valid modpack installation.
      // If not working on Windows, this is assumed to be local files generated from `npm run generate:modpack-files` for development purposes.
      process.env["APPDATA"] = `${__dirname}/../mock-files/APP_DATA`;
    }
  }
}

const start = async () => {
  const launcherApplication = new LauncherApplication();
  await launcherApplication.boot();
  await launcherApplication.start();

  app.on("second-instance", () => {
    const windowService =
      launcherApplication.getServiceByClassSync(WindowService);
    // Someone tried to run a second instance, so focus the original window.
    windowService.focusWindow();
  });

  return launcherApplication;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// TODO this should probably use `app.whenReady().then(()` instead
app.on("ready", () => {
  // Initialize electron-log IPC before window creation (required for v5)
  log.initialize();

  start()
    .then((launcherApplication) => {
      // In test mode, add some additional properties to the process object to be used later
      if (process.env["IS_TEST"]) {
        (process as ProcessWithGlobals)._globals_ = {
          // Store the launcher application in the process so it can be accessed from tests to replace artefacts if necessary.
          // This is due to playwright not being able to access `require` from the main process.
          launcherApplication,
          // Store the promisify unique symbol in the process so that promisified methods can be mocked correctly.
          promisifyCustomSymbol: promisify.custom,
        };
      }
    })
    .then(() => log.debug("App started"))
    .catch((error) => {
      const errorService = new ErrorService(log, dialog);
      errorService.handleError(
        "Failed to start application",
        (error as Error).message
      );
      process.exit(1);
    });
});

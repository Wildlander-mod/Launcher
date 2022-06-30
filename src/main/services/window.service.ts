import { app, BrowserWindow, dialog, protocol } from "electron";
import { URL } from "url";
import { readFile } from "fs";
import path from "path";
import { appRoot, isDevelopment } from "@/main/services/config.service";
import { logger } from "@/main/logger";
import { BindingScope, injectable } from "@loopback/context";
import contextMenu from "electron-context-menu";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class WindowService {
  private window!: Electron.BrowserWindow;

  private static handleFatalError(message: string, err: string | Error) {
    logger.error(`${message}. ${err}`);

    dialog.showMessageBoxSync({
      type: "error",
      title: "A fatal error occurred!",
      message: `
    ${message}
    ${err}
    `,
    });

    app.quit();
  }

  getWindow() {
    return this.window;
  }

  getWebContents() {
    return this.window.webContents;
  }

  close() {
    logger.debug("Close application");
    this.getWindow().close();
    app.quit();
  }

  reload() {
    logger.debug("Reload window");
    this.getWindow().reload();
  }

  minimize() {
    logger.debug("Minimize window");
    this.getWindow().minimize();
  }

  focusWindow() {
    const window = this.getWindow();
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  }

  async createBrowserWindow() {
    logger.debug("Creating browser window");

    try {
      // Add default context menu
      contextMenu({
        showSaveImageAs: true,
      });

      // Create the browser window.
      this.window = new BrowserWindow({
        frame: false,
        height: 580,
        minHeight: 580,
        maxHeight: 580,
        width: 1000,
        minWidth: 1000,
        maxWidth: 1000,
        resizable: false,
        maximizable: false,
        // disable initial window from showing so focus can be prevented while developing
        show: false,
        webPreferences: {
          // Use pluginOptions.nodeIntegration, leave this alone
          // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(appRoot, "main/preload.js"),
        },
      });

      if (isDevelopment) {
        // Load the url of the dev server if in development mode
        await this.window.loadURL("http://localhost:8080");
        if (!process.env.IS_TEST) {
          this.window.webContents.openDevTools();
        }
        // show window without setting focus
        this.window.showInactive();
      } else {
        this.createProtocol("app");
        // Load the index.html when not in development
        await this.window.loadURL("app://./index.html");
        this.window.show();
      }
    } catch (error) {
      if (error instanceof Error) {
        WindowService.handleFatalError(
          "Unable to create browser window",
          error
        );
      } else {
        WindowService.handleFatalError(
          "Unable to create browser window with unknown error",
          ""
        );
      }
    }
  }

  /**
   * Taken from vue-cli-plugin-electron-builder to remove import/export because the plugin doesn't ship a dist.
   * If imported directly, it causes issues when dynamically requiring services that might require this file
   */
  private createProtocol(scheme: string) {
    protocol.registerBufferProtocol(scheme, (request, respond) => {
      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName); // Needed in case URL contains spaces

      readFile(path.join(appRoot, pathName), (error, data) => {
        if (error) {
          logger.error(
            `Failed to read ${pathName} on ${scheme} protocol`,
            error
          );
        }
        const extension = path.extname(pathName).toLowerCase();
        let mimeType = "";

        if (extension === ".js") {
          mimeType = "text/javascript";
        } else if (extension === ".html") {
          mimeType = "text/html";
        } else if (extension === ".css") {
          mimeType = "text/css";
        } else if (extension === ".svg" || extension === ".svgz") {
          mimeType = "image/svg+xml";
        } else if (extension === ".json") {
          mimeType = "application/json";
        } else if (extension === ".wasm") {
          mimeType = "application/wasm";
        }

        respond({ mimeType, data });
      });
    });
  }
}

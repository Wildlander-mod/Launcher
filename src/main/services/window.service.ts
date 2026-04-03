import type Electron from "electron";
import type { BrowserWindow } from "electron";
import { URL } from "url";
import path from "path";
import { appRoot } from "@/main/services/config.service";
import { BindingScope, inject, injectable } from "@loopback/context";
import { Logger, LoggerBinding } from "@/main/logger";
import { ElectronBinding } from "@/main/bindings/electron.binding";
import {
  ContextMenu,
  ContextMenuBinding,
} from "@/main/bindings/context-menu.binding";
import { service } from "@loopback/core";
import { Dialog, DialogProvider } from "@/main/services/dialog.service";
import { IsDevelopmentBinding } from "@/main/bindings/isDevelopment.binding";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class WindowService {
  private window!: BrowserWindow;

  constructor(
    @inject(LoggerBinding) private logger: Logger,
    @inject(IsDevelopmentBinding) private isDevelopment: boolean,
    @inject(ElectronBinding) private electron: typeof Electron,
    @inject(ContextMenuBinding) private contextMenu: ContextMenu,
    @service(DialogProvider) private dialog: Dialog
  ) {}

  setWindow(window: BrowserWindow) {
    this.window = window;
  }
  getWindow() {
    return this.window;
  }

  getWebContents() {
    return this.window.webContents;
  }

  quit() {
    this.logger.debug("Quit application");
    this.electron.app.quit();
  }

  reload() {
    this.logger.debug("Reload window");
    this.getWindow().reload();
  }

  minimize() {
    this.logger.debug("Minimize window");
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
    this.logger.debug("Creating browser window");

    if (this.window) {
      this.logger.debug("Browser window already exists");
      return;
    }

    try {
      // Add default context menu
      this.contextMenu({
        showSaveImageAs: true,
      });

      const width = 1000;
      const height = 580;

      this.window = new this.electron.BrowserWindow({
        frame: false,
        height,
        minHeight: height,
        maxHeight: height,
        width,
        minWidth: width,
        maxWidth: width,
        resizable: false,
        maximizable: false,
        // disable initial window from showing so focus can be prevented while developing
        show: false,
        webPreferences: {
          // Use pluginOptions.nodeIntegration, leave this alone
          // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(appRoot, "preload/index.js"),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.handleFatalError("Unable to create browser window", error);
      } else {
        this.handleFatalError(
          "Unable to create browser window with unknown error",
          ""
        );
      }
    }
  }

  /**
   * @param urlPath - Must start with a '/'
   */
  async load(urlPath: string) {
    try {
      if (this.isDevelopment) {
        // HMR for renderer base on electron-vite cli.
        // Load the remote URL for development or the local html file for production.
        const host =
          process.env["ELECTRON_RENDERER_URL"] ?? "http://localhost:8080/";
        const url = new URL(`${host}#${urlPath}`).toString();
        await this.navigateInWindow(url);
        if (!process.env["IS_TEST"]) {
          this.window.webContents.openDevTools();
        }
        // Show window without setting focus
        this.window.showInactive();
      } else {
        await this.window.loadFile(
          path.join(__dirname, "../renderer/index.html")
        );
        this.window.show();
      }
    } catch (error) {
      if (error instanceof Error) {
        this.handleFatalError("Unable to load application page", error);
      } else {
        this.handleFatalError(
          "Unable to load application page with unknown error",
          ""
        );
      }
    }
  }

  private handleFatalError(message: string, err: string | Error) {
    this.logger.error(`${message}. ${err}`);

    this.dialog.showMessageBoxSync({
      type: "error",
      title: "A fatal error occurred!",
      message: `
    ${message}
    ${err}
    `,
    });

    this.electron.app.quit();
  }

  async navigateInWindow(url: string) {
    this.logger.debug(`Loading url: ${url}`);

    const windowOpen = this.window.isVisible();

    try {
      await this.window.loadURL(url);
    } catch (error) {
      if ((error as { code?: string })?.code === "ERR_FAILED" && windowOpen) {
        // If the browser window is already open, a URL change will cause electron to think the request is aborted.
        // When the app loads a URL, the hash is changed immediately.
        // If the window is already open, electron considers this a change in URL and a failure so it errors.
        // Reload the window to continue the navigation
        // TODO this is only necessary because of the hash based history. Replacing this with non-hash history should solve this
        this.logger.debug(`Window already open. Reloading window`);
        this.window.reload();
      } else {
        throw error;
      }
    }
  }
}

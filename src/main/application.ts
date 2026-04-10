import { StartupService } from "./services/startup.service";
import type { Constructor } from "@loopback/context";
import { WindowService } from "./services/window.service";
import { LoggerBinding } from "./logger";
import {
  Application,
  createServiceBinding,
  type ServiceOrProviderClass,
} from "@loopback/core";
import type { Controller } from "./decorators/controller.decorator";
import { ErrorService } from "./services/error.service";
import logger from "electron-log";
import { VersionBinding } from "./bindings/version.binding";
import electron, { app } from "electron";
import { IsDevelopmentBinding } from "./bindings/isDevelopment.binding";
import { ChildProcessBinding } from "./bindings/child-process.binding";
import * as child_process from "child_process";
import { PsListBinding } from "./bindings/psList.binding";
import psList from "ps-list";
import { ProcessKillBinding } from "./bindings/process-kill.binding";
import { ElectronBinding } from "./bindings/electron.binding";
import { AutoUpdaterBinding } from "./bindings/autoUpdater.binding";
import { autoUpdater } from "electron-updater";
import contextMenu from "electron-context-menu";
import { ContextMenuBinding } from "./bindings/context-menu.binding";
import { ConfigBinding } from "./bindings/config.binding";
import { ConfigService } from "./services/config.service";
import { is } from "@electron-toolkit/utils";
import log from "electron-log/main";

// Services
import { BlacklistService } from "./services/blacklist.service";
import { DialogProvider } from "./services/dialog.service";
import { EnbService } from "./services/enb.service";
import { GameService } from "./services/game.service";
import { GraphicsService } from "./services/graphics.service";
import { InstructionService } from "./services/instruction.service";
import { LauncherService } from "./services/launcher.service";
import { MigrationService } from "./services/migration.service";
import { ModOrganizerService } from "./services/modOrganizer.service";
import { ModpackService } from "./services/modpack.service";
import { ProfileService } from "./services/profile.service";
import { ResolutionService } from "./services/resolution.service";
import { SystemService } from "./services/system.service";
import { UpdateService } from "./services/update.service";
import { WabbajackService } from "./services/wabbajack.service";

// Controllers
import { ConfigController } from "./controllers/config/config.controller";
import { DialogController } from "./controllers/dialog/dialog.controller";
import { EnbController } from "./controllers/enb/enb.controller";
import { GraphicsController } from "./controllers/graphics/graphics.controller";
import { LauncherController } from "./controllers/launcher/launcher.controller";
import { ModOrganizerController } from "./controllers/modOrganizer/modOrganizer.controller";
import { ModpackController } from "./controllers/modpack/modpack.controller";
import { ProfileController } from "./controllers/profile/profile.controller";
import { ResolutionController } from "./controllers/resolution/resolution.controller";
import { SystemController } from "./controllers/system/system.controller";
import { WabbajackController } from "./controllers/wabbajack/wabbajack.controller";
import { WindowController } from "./controllers/window/window.controller";

const serviceNamespace = "services";

export class LauncherApplication extends Application {
  constructor() {
    super();

    this.bindLogger();

    this.onStart(async () => {
      try {
        await this.registerHandlers();

        const startupService = await this.getServiceByClass(StartupService);
        startupService.registerStartupCommands();
        await startupService.runStartup();

        await this.startBrowser();
      } catch (error) {
        const errorService = await this.getServiceByClass(ErrorService);
        errorService.handleError(
          "Failed to start application",
          (error as Error).message
        );
        process.exit(1);
      }
    });

    this.bindStaticValues();
    this.registerServices();
    this.registerControllers();
  }

  public getServiceByClass<T>(cls: Constructor<T>): Promise<T> {
    return this.get(`${serviceNamespace}.${cls.name}`);
  }

  public getServiceByClassSync<T>(cls: Constructor<T>): T {
    return this.getSync(`${serviceNamespace}.${cls.name}`);
  }

  private async registerHandlers() {
    logger.silly("Registering handlers");

    for (const controllerBinding of this.findByTag("controller")) {
      (await this.get<Controller>(controllerBinding.key)).registerHandlers();
    }

    logger.silly("Registered handlers");
  }

  private async startBrowser() {
    const renderService = await this.getServiceByClass(WindowService);
    await renderService.createBrowserWindow();
    await renderService.load("/");
  }

  private bindLogger() {
    this.bind(LoggerBinding).to(log);
  }

  private bindStaticValues() {
    this.bind(ElectronBinding).to(electron);
    this.bind(VersionBinding).to(app.getVersion());
    this.bind(IsDevelopmentBinding).to(process.env["IS_E2E"] ? false : is.dev);
    this.bind(ChildProcessBinding).to(child_process);
    this.bind(PsListBinding).to(psList);
    this.bind(ProcessKillBinding).to(process.kill);
    this.bind(AutoUpdaterBinding).to(autoUpdater);
    this.bind(ContextMenuBinding).to(contextMenu);
    this.bind(ConfigBinding).to(ConfigService.getNewUserPreferencesStore());
  }

  private registerServices() {
    const services: ServiceOrProviderClass<unknown>[] = [
      BlacklistService,
      ConfigService,
      DialogProvider,
      EnbService,
      ErrorService,
      GameService,
      GraphicsService,
      InstructionService,
      LauncherService,
      MigrationService,
      ModOrganizerService,
      ModpackService,
      ProfileService,
      ResolutionService,
      StartupService,
      SystemService,
      UpdateService,
      WabbajackService,
      WindowService,
    ];
    for (const cls of services) {
      this.add(createServiceBinding(cls));
    }
  }

  private registerControllers() {
    const controllers: Constructor<unknown>[] = [
      ConfigController,
      DialogController,
      EnbController,
      GraphicsController,
      LauncherController,
      ModOrganizerController,
      ModpackController,
      ProfileController,
      ResolutionController,
      SystemController,
      WabbajackController,
      WindowController,
    ];
    for (const cls of controllers) {
      this.bind(`controllers.${cls.name}`).toClass(cls).tag("controller");
    }
  }
}

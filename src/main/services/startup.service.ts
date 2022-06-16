import { BindingScope, injectable } from "@loopback/context";
import { logger } from "@/main/logger";
import { service } from "@loopback/core";
import { app } from "electron";
import { ConfigService } from "@/main/services/config.service";
import { ModpackService } from "@/main/services/modpack.service";
import { LauncherService } from "@/main/services/launcher.service";
import { platform, version, type } from "os";
import { WabbajackService } from "@/main/services/wabbajack.service";
import { ResolutionService } from "@/main/services/resolution.service";

interface StartupCommand {
  name: string;
  execute: () => unknown;
  // Only run certain startup if the modpack is set
  requiresModpack?: boolean;
}

@injectable({
  scope: BindingScope.SINGLETON,
})
export class StartupService {
  private startupCommands: StartupCommand[] = [];

  constructor(
    @service(ModpackService) private modpackService: ModpackService,
    @service(LauncherService) private launcherService: LauncherService,
    @service(ConfigService) private configService: ConfigService,
    @service(WabbajackService) private wabbajackService: WabbajackService,
    @service(ResolutionService) private resolutionService: ResolutionService
  ) {}

  public registerStartupCommands() {
    this.startupCommands = [
      {
        name: "Delete invalid modpack preference",
        execute: () => {
          if (!this.modpackService.checkCurrentModpackPathIsValid()) {
            const modpackDirectory = this.modpackService.getModpackDirectory();
            logger.error(
              `Current selected modpack (${modpackDirectory}) is invalid. Removing so the user can select a valid one.`
            );
            this.modpackService.deleteModpackDirectory();
          }
        },
        requiresModpack: true,
      },
      {
        name: "Select modpack",
        execute: () => this.launcherService.refreshModpack(),
        requiresModpack: true,
      },
      {
        name: "Startup logs",
        execute: async () => {
          logger.debug(`
            --- Startup debug logs ---
            OS: ${type()} ${platform()} ${version()}
            Modpack version: ${await this.wabbajackService.getModpackVersion()}
            Launcher version: ${app.getVersion()} 
            Modpack path: ${this.modpackService.getModpackDirectory()}
            Current screen resolution: ${JSON.stringify(
              this.resolutionService.getCurrentResolution()
            )}
          `);
        },
      },
    ];
  }

  public runStartup() {
    return Promise.all(
      this.startupCommands.map(async (command) => {
        if (
          (command.requiresModpack && this.modpackService.isModpackSet()) ||
          !command.requiresModpack
        ) {
          logger.debug(`Running startup command: ${command.name}`);
          await command.execute();
        }
      })
    );
  }
}

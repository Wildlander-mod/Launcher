import { BindingScope, injectable } from "@loopback/context";
import { logger } from "@/main/logger";
import { service } from "@loopback/core";
import { ConfigService } from "@/main/services/config.service";
import { ModpackService } from "@/main/services/modpack.service";
import { LauncherService } from "@/main/services/launcher.service";

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
    @service(ConfigService) private configService: ConfigService
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

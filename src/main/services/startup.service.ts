import { BindingScope, injectable } from "@loopback/context";
import { logger } from "@/main/logger";
import { service } from "@loopback/core";
import { ConfigService } from "@/main/services/config.service";
import { ModpackService } from "@/main/services/modpack.service";

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
    @service(ConfigService) private configService: ConfigService
  ) {}

  public registerStartupCommands() {
    this.startupCommands = [
      {
        name: "Ensure modpack is valid",
        execute: () => {
          if (!this.modpackService.checkCurrentModpackPathIsValid()) {
            const modpackDirectory = this.modpackService.getModpackDirectory();
            logger.error(
              `Current selected modpack (${modpackDirectory}) is invalid. Removing so the user can select a valid one.`
            );
            // If the modpack is not valid, remove it so the user can select another
            this.modpackService.deleteModpackDirectory();
          }
        },
      },
      {
        name: "Select modpack",
        execute: () => this.modpackService.refreshModpack(),
        requiresModpack: true,
      },
    ];
  }

  public runStartup() {
    return Promise.all(
      this.startupCommands.map(async (command) => {
        logger.debug(`Running startup command: ${command.name}`);
        if (
          (command.requiresModpack && this.modpackService.isModpackSet()) ||
          !command.requiresModpack
        ) {
          await command.execute();
        }
      })
    );
  }
}

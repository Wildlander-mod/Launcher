import { AdditionalInstructions } from "@/additional-instructions";
import modpackAdditionalInstructions from "@/additional-instructions.json";
import fs from "fs";
import { BindingScope, injectable } from "@loopback/context";
import { logger } from "@/main/logger";
import { service } from "@loopback/core";
import { ConfigService } from "@/main/services/config.service";
import { ProfileService } from "@/main/services/profile.service";
import * as readline from "readline";
import * as os from "os";
import { PathLike } from "fs-extra";
import { WabbajackService } from "@/main/services/wabbajack.service";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class InstructionService {
  constructor(
    @service(ConfigService) private configService: ConfigService,
    @service(ProfileService) private profileService: ProfileService,
    @service(WabbajackService) private wabbajackService: WabbajackService
  ) {}

  getInstructions(): AdditionalInstructions {
    return modpackAdditionalInstructions as AdditionalInstructions;
  }

  async execute(instructions: AdditionalInstructions, target?: string) {
    const modpackVersion = await this.wabbajackService.getModpackVersion();

    for (const instruction of instructions) {
      logger.debug(
        `Handling enb instruction ${JSON.stringify(
          instruction
        )} for modpack version ${modpackVersion}`
      );
      if (
        instruction.version === undefined ||
        instruction.version === modpackVersion
      ) {
        switch (instruction.action) {
          case "disable-plugin":
            if (instruction.target === target) {
              await this.togglePlugin(instruction.plugin, "disable");
            } else {
              await this.togglePlugin(instruction.plugin, "enable");
            }
            break;

          case "disable-ultra-widescreen":
            return true;
        }
      }
    }
  }

  /**
   * plugins.txt: dictates the order, enabling, and disabling of plugins (right panel in MO2)
   * Enabled plugins have an asterisk, like this: *wildlander.esp
   * Disabled plugins have NO asterisk, like this: wildlander.esp
   */
  async togglePlugin(
    plugin: string,
    state: "enable" | "disable"
  ): Promise<void> {
    logger.info(`Toggling plugin ${plugin} to state ${state}`);

    for (const pluginsFile of await this.getPluginFiles()) {
      logger.debug(`Toggling plugin in ${pluginsFile}`);
      const plugins = this.getPluginsFromFile(pluginsFile);

      const editedFile = [];
      for await (let currentPlugin of plugins) {
        if (currentPlugin.replace("*", "") === plugin) {
          if (state === "disable" && currentPlugin.startsWith("*")) {
            logger.debug(`Disabling plugin ${plugin}`);
            currentPlugin = currentPlugin.replace("*", "");
          } else if (state === "enable" && !currentPlugin.startsWith("*")) {
            logger.debug(`Enabling plugin ${plugin}`);
            currentPlugin = `*${currentPlugin}`;
          }
        }

        editedFile.push(currentPlugin);
      }

      await fs.promises.writeFile(
        pluginsFile,
        editedFile.join(os.EOL),
        "utf-8"
      );
    }
  }

  getPluginsFromFile(pluginsFile: PathLike) {
    return readline.createInterface({
      input: fs.createReadStream(pluginsFile),
      crlfDelay: Infinity,
    });
  }

  async getPluginFiles() {
    return (await this.profileService.getProfiles()).map(
      (profile) =>
        `${this.profileService.profileDirectory()}/${profile.real}/plugins.txt`
    );
  }
}

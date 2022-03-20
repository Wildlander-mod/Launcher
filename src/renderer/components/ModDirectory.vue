<template>
  <BaseLabel :label="label" />
  <AppDropdownFileSelect
    :options="modpacks"
    :current-selection="modDirectory"
    default-text="Select mod directory..."
    v-if="modpacks"
    @file-selected="modDirectorySet"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { SelectOption } from "@/renderer/components/BaseDropdown.vue";
import BaseLabel from "@/renderer/components/BaseLabel.vue";
import modpack from "@/modpack.json";
import { MODPACK_EVENTS } from "@/main/controllers/modpack/mopack.events";
import { Prop } from "vue-property-decorator";
import { WABBAJACK_EVENTS } from "@/main/controllers/wabbajack/wabbajack.events";
import { WindowEvents } from "@/main/controllers/window/window.events";
import { ENABLE_LOADING_EVENT } from "@/renderer/services/event.service";
import AppDropdownFileSelect from "@/renderer/components/AppDropdownFileSelect.vue";

@Options({
  components: { AppDropdownFileSelect, BaseLabel },
})
export default class ModDirectory extends Vue {
  private modDirectory!: SelectOption | null;
  private modpacks: SelectOption[] | null = null;
  @Prop({ default: `${modpack.name} installation folder` })
  private label!: string;

  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
  private messageService = injectStrict(SERVICE_BINDINGS.MESSAGE_SERVICE);
  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  async created() {
    this.modDirectory = (await this.getCurrentModDirectory()) ?? null;

    const installedModpacks = await this.getInstalledModpacks();

    if (
      this.modDirectory !== null &&
      !installedModpacks.includes(this.modDirectory.value as string)
    ) {
      installedModpacks.push(this.modDirectory.value as string);
    }
    this.modpacks = await this.convertModpackPathsToOptions(installedModpacks);
  }

  async getCurrentModDirectory() {
    const currentModDirectory = await this.ipcService.invoke(
      MODPACK_EVENTS.GET_MODPACK
    );

    if (
      currentModDirectory &&
      (await this.checkModDirectoryIsValid(currentModDirectory))
    ) {
      return {
        text: currentModDirectory,
        value: currentModDirectory,
      };
    }
  }

  async getInstalledModpacks() {
    return (await this.ipcService.invoke(
      WABBAJACK_EVENTS.GET_INSTALLED_MODPACKS
    )) as string[];
  }

  async convertModpackPathsToOptions(
    modpacks: string[]
  ): Promise<SelectOption[]> {
    return modpacks.map((modpack) => ({ text: modpack, value: modpack }));
  }

  async checkModDirectoryIsValid(filepath: string): Promise<boolean> {
    const modDirectoryOkay = (await this.ipcService.invoke(
      MODPACK_EVENTS.IS_MODPACK_DIRECTORY_VALID,
      filepath
    )) as boolean;

    if (!modDirectoryOkay) {
      await this.triggerError();
      return false;
    }
    return true;
  }

  async modDirectorySet(filepath: string) {
    if (await this.checkModDirectoryIsValid(filepath)) {
      this.eventService.emit(ENABLE_LOADING_EVENT);
      await this.ipcService.invoke(MODPACK_EVENTS.SET_MODPACK, filepath);
      this.modDirectory = { text: filepath, value: filepath };
      await this.ipcService.invoke(WindowEvents.RELOAD);
    }
  }

  async triggerError() {
    await this.messageService.error({
      title: "Invalid modpack directory selected",
      error:
        "Please ensure this is a valid modpack installation directory. Remember, this is NOT the Skyrim directory, it is the mod's installation directory (containing the ModOrganizer.exe/profiles/etc.).",
    });
  }
}
</script>

<template>
  <BaseLabel :label="label" />
  <AppDropdownFileSelect
    :options="modpacks"
    :current-selection="modDirectory"
    @file-selected="modDirectorySet"
    default-text="Select mod directory..."
    v-if="modpacks"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { modpack, USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import { Prop } from "vue-property-decorator";
import {
  DISABLE_ACTIONS_EVENT,
  DISABLE_LOADING_EVENT,
  ENABLE_ACTIONS_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/App.vue";
import AppDropdownFileSelect from "@/components/AppDropdownFileSelect.vue";
import { SelectOption } from "@/components/BaseDropdown.vue";
import { Modpack } from "@/modpack-metadata";
import BaseLabel from "@/components/BaseLabel.vue";

export const modDirectorySetEvent = "modDirectorySet";
export const modDirectoryAlreadySetEvent = "modDirectoryAlreadySet";
export const modDirectoryInvalidEvent = "modDirectoryInvalidEvent";

@Options({
  components: { BaseLabel, AppDropdownFileSelect },
  emits: [modDirectoryAlreadySetEvent, modDirectoryInvalidEvent],
})
export default class ModDirectory extends Vue {
  @Prop({ default: false }) private centered!: boolean;
  @Prop({ default: false }) private hideOpen!: boolean;
  private modDirectory!: SelectOption | null;
  private modpacks: SelectOption[] | null = null;
  private modpack!: Modpack;
  @Prop({ default: `${modpack.name} installation folder` })
  private label!: string;

  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);

  async created() {
    this.modpack = modpack;

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
    const currentModDirectory = userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );

    if (
      currentModDirectory &&
      (await this.checkModDirectoryIsValid(currentModDirectory))
    ) {
      this.$emit(modDirectoryAlreadySetEvent);

      return {
        text: currentModDirectory,
        value: currentModDirectory,
      };
    }
  }

  async getInstalledModpacks() {
    return (await ipcRenderer.invoke(
      IPCEvents.GET_INSTALLED_MODPACKS
    )) as string[];
  }

  async convertModpackPathsToOptions(
    modpacks: string[]
  ): Promise<SelectOption[]> {
    return modpacks.map((modpack) => ({ text: modpack, value: modpack }));
  }

  async checkModDirectoryIsValid(filepath: string): Promise<boolean> {
    const modDirectoryOkay = (await ipcRenderer.invoke(
      IPCEvents.CHECK_MOD_DIRECTORY,
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
      this.eventService.emit(DISABLE_ACTIONS_EVENT);
      this.eventService.emit(ENABLE_LOADING_EVENT);

      userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, filepath);
      this.modDirectory = { text: filepath, value: filepath };
      this.eventService.emit(modDirectorySetEvent);
      await ipcRenderer.invoke(IPCEvents.MODPACK_SELECTED);

      this.eventService.emit(ENABLE_ACTIONS_EVENT);
      this.eventService.emit(DISABLE_LOADING_EVENT);
    }
  }

  async triggerError() {
    await ipcRenderer.invoke(IPCEvents.ERROR, {
      title: "Invalid modpack directory selected",
      error:
        "Please ensure this is a valid mockpack installation directory. Remember, this is NOT the Skyrim directory, it is the mod's installation directory (containing the ModOrganizer.exe/profiles/etc.).",
    });

    this.$emit(modDirectoryInvalidEvent);
  }
}
</script>

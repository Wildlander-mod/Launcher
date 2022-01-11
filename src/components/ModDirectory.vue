<template>
  <AppFileSelect
    :filepath="modDirectory"
    :label="label"
    :centered="centered"
    :hide-open="hideOpen"
    v-if="!modDirectoryLoading"
    @filepathSelected="modDirectorySet"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { modpack, USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import AppFileSelect from "@/components/AppFileSelect.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import { Prop } from "vue-property-decorator";
import { Modpack } from "@/modpack-metadata";
import {
  DISABLE_ACTIONS_EVENT,
  DISABLE_LOADING_EVENT,
  ENABLE_ACTIONS_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/App.vue";

export const modDirectorySetEvent = "modDirectorySet";
export const modDirectoryAlreadySetEvent = "modDirectoryAlreadySet";
export const modDirectoryInvalidEvent = "modDirectoryInvalidEvent";

@Options({
  components: { AppFileSelect },
  emits: [modDirectoryAlreadySetEvent, modDirectoryInvalidEvent],
})
export default class ModDirectory extends Vue {
  @Prop({ default: false }) private centered!: boolean;
  @Prop({ default: false }) private hideOpen!: boolean;
  @Prop({ default: `${modpack.name} installation folder` })
  private label!: string;
  private modpack!: Modpack;
  private modDirectory = "";
  private modDirectoryLoading = true;

  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);

  async created() {
    this.modpack = modpack;

    await this.setInitialModDirectory();

    this.modDirectoryLoading = false;
  }

  async setInitialModDirectory() {
    const currentModDirectory = userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );

    if (
      currentModDirectory &&
      (await this.checkModDirectoryIsValid(currentModDirectory))
    ) {
      this.modDirectory = currentModDirectory;
      this.$emit(modDirectoryAlreadySetEvent);
    }
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
      this.modDirectory = filepath;
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

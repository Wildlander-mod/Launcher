<template>
  <FileSelect
    :on-filepath-change="onModDirectoryChange"
    :pre-filepath-change="preModDirectoryChange"
    :initial-filepath="initialModDirectory"
    label="Ultimate Skyrim Directory"
    :centered="centered"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import FileSelect from "@/components/FileSelect.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import {
  EventService,
  injectStrict,
  SERVICE_BINDINGS
} from "@/services/service-container";

export const modDirectorySetEvent = "modDirectorySet";
export const invalidFilepathEvent = "invalidFilepath";

@Options({
  components: { FileSelect }
})
export default class ModDirectory extends Vue {
  private initialModDirectory = "";
  private centered = false;

  private eventService!: EventService;

  async created() {
    this.eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);

    const currentModDirectory = userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );

    if (currentModDirectory) {
      if (await this.checkModDirectoryIsOkay(currentModDirectory)) {
        this.initialModDirectory = currentModDirectory;
      } else {
        await this.triggerError();
        this.$emit(invalidFilepathEvent);
      }
    }
  }

  async preModDirectoryChange(filepath: string) {
    const modDirectoryOkay = await this.checkModDirectoryIsOkay(filepath);

    if (!modDirectoryOkay) {
      await this.triggerError();
    }
    return modDirectoryOkay;
  }

  async onModDirectoryChange(filepath: string) {
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, filepath);
    this.$emit(modDirectorySetEvent);
    this.eventService.emit(modDirectorySetEvent);
  }

  async triggerError() {
    await ipcRenderer.invoke(IPCEvents.ERROR, {
      title: "Invalid mod directory selected",
      error:
        "Please ensure this is a valid MO2 directory. Remember, this is NOT the Skyrim directory, it is the mod's MO2 directory."
    });
  }

  async checkModDirectoryIsOkay(filepath: string): Promise<boolean> {
    //Ensure the mod directory contains a valid MO2 setup
    return await ipcRenderer.invoke(IPCEvents.CHECK_MOD_DIRECTORY, filepath);
  }
}
</script>

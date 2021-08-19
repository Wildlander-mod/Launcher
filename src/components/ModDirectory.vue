<template>
  <AppFileSelect
    :on-filepath-change="onModDirectoryChange"
    :pre-filepath-change="preModDirectoryChange"
    :initial-filepath="modDirectory"
    label="Ultimate Skyrim Directory"
    :centered="centered"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import AppFileSelect from "@/components/AppFileSelect.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import { Prop, Watch } from "vue-property-decorator";

export const modDirectorySetEvent = "modDirectorySet";
export const invalidFilepathEvent = "invalidFilepath";

@Options({
  components: { AppFileSelect },
})
export default class ModDirectory extends Vue {
  private modDirectory = "";
  @Prop({ default: false }) private centered!: boolean;

  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);

  async created() {
    const currentModDirectory = userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );

    if (
      currentModDirectory &&
      (await this.preModDirectoryChange(currentModDirectory))
    ) {
      this.modDirectory = currentModDirectory;
    }
  }

  async preModDirectoryChange(filepath: string) {
    const modDirectoryOkay = await this.checkModDirectoryIsOkay(filepath);

    if (!modDirectoryOkay) {
      await this.triggerError();
      this.$emit(invalidFilepathEvent);
    }
    return modDirectoryOkay;
  }

  onModDirectoryChange(filepath: string) {
    this.modDirectory = filepath;
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, filepath);
    this.modDirectorySet();
  }

  @Watch("modDirectory")
  modDirectorySet() {
    this.$emit(modDirectorySetEvent);
    this.eventService.emit(modDirectorySetEvent);
  }

  async triggerError() {
    await ipcRenderer.invoke(IPCEvents.ERROR, {
      title: "Invalid mod directory selected",
      error:
        "Please ensure this is a valid MO2 directory. Remember, this is NOT the Skyrim directory, it is the mod's MO2 directory.",
    });
  }

  async checkModDirectoryIsOkay(filepath: string): Promise<boolean> {
    //Ensure the mod directory contains a valid MO2 setup
    return await ipcRenderer.invoke(IPCEvents.CHECK_MOD_DIRECTORY, filepath);
  }
}
</script>

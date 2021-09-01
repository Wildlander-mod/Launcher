<template>
  <AppFileSelect
    :on-filepath-change="onSkyrimDirectoryChange"
    :pre-filepath-change="checkSkyrimDirectoryIsValid"
    :initial-filepath="skyrimDirectory"
    label="Skyrim Game Folder"
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

export const skyrimDirectorySetEvent = "skyrimDirectorySet";
export const invalidFilepathEvent = "invalidFilepath";

@Options({
  components: { AppFileSelect },
})
export default class SkyrimDirectory extends Vue {
  private skyrimDirectory = "";
  @Prop({ default: false }) private centered!: boolean;

  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);

  async created() {
    const currentSkyrimDirectory = userPreferences.get(
      USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY
    );

    if (
      currentSkyrimDirectory &&
      (await this.checkSkyrimDirectoryIsValid(currentSkyrimDirectory))
    ) {
      this.skyrimDirectory = currentSkyrimDirectory;
    }
  }

  async checkSkyrimDirectoryIsValid(filepath: string) {
    const skyrimDirectoryOkay = await this.checkSkyrimDirectoryIsOkay(filepath);

    if (!skyrimDirectoryOkay) {
      await this.triggerError();
      this.$emit(invalidFilepathEvent);
    }
    return skyrimDirectoryOkay;
  }

  onSkyrimDirectoryChange(filepath: string) {
    this.skyrimDirectory = filepath;
    userPreferences.set(USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY, filepath);
    this.skyrimDirectorySet();
  }

  @Watch("skyrimDirectory")
  skyrimDirectorySet() {
    this.$emit(skyrimDirectorySetEvent);
    this.eventService.emit(skyrimDirectorySetEvent);
  }

  async triggerError() {
    await ipcRenderer.invoke(IPCEvents.ERROR, {
      title: "Invalid skyrim directory selected",
      error:
        "Please ensure this is a valid Skyrim directory. It should contain either a TESV.exe or SkyrimSE.exe",
    });
  }

  async checkSkyrimDirectoryIsOkay(filepath: string): Promise<boolean> {
    //Ensure the skyrim directory is valid
    return await ipcRenderer.invoke(IPCEvents.CHECK_SKYRIM_DIRECTORY, filepath);
  }
}
</script>

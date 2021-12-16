<template>
  <BaseDropdown
    :current-selection="selectedPreset"
    :on-option-selected="onPresetSelected"
    :options="presets"
    v-if="!loadingPresets"
    :grow="true"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseDropdown, { SelectOption } from "@/components/BaseDropdown.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import { modDirectorySetEvent } from "@/components/ModDirectory.vue";
import { logger } from "@/main/logger";
import { FriendlyDirectoryMap } from "@/modpack-metadata";

@Options({
  components: { BaseDropdown },
})
export default class ProfileSelection extends Vue {
  selectedPreset: SelectOption = { text: "", value: "" };
  presets: SelectOption[] = [this.selectedPreset];
  loadingPresets = true;

  async created() {
    const eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
    eventService.on(modDirectorySetEvent, this.getPresets);

    this.presets = await this.getPresets();

    this.setInitialPreset();

    this.loadingPresets = false;
  }

  onPresetSelected(option: SelectOption) {
    userPreferences.set(USER_PREFERENCE_KEYS.PRESET, option.value);
  }

  setInitialPreset() {
    const presetPreference = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);

    this.selectedPreset = presetPreference
      ? this.presets.find((preset) => preset.value === presetPreference) ??
        this.presets[0]
      : this.presets[0];

    logger.debug(`Setting initial preset to ${this.selectedPreset.text}`);

    userPreferences.set(USER_PREFERENCE_KEYS.PRESET, this.selectedPreset.value);
  }

  async getPresets() {
    return (
      (await ipcRenderer.invoke(
        IPCEvents.GET_PRESETS
      )) as FriendlyDirectoryMap[]
    ).map(({ friendly, real }) => ({
      text: friendly,
      value: real,
    }));
  }
}
</script>

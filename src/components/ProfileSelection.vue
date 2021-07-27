<template>
  <Select
    :initial-selection="selectedPreset"
    :on-option-selected="onPresetSelected"
    :options="presets"
    :loading-data="loadingData"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Select, { SelectOption } from "@/components/controls/Select.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";

@Options({
  components: { Select }
})
export default class ProfileSelection extends Vue {
  selectedPreset: SelectOption = { text: "", value: "" };
  presets: SelectOption[] = [this.selectedPreset];
  loadingData = true;

  async created() {
    const presets = (await ipcRenderer.invoke(
      IPCEvents.GET_PRESETS
    )) as string[];
    const userPreset = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);
    this.presets = presets.map(preset => ({ text: preset, value: preset }));

    this.selectedPreset = userPreset
      ? this.presets.find(preset => preset.value === userPreset) ??
        this.presets[0]
      : this.presets[0];

    this.loadingData = false;
  }

  onPresetSelected(option: SelectOption) {
    userPreferences.set(USER_PREFERENCE_KEYS.PRESET, option.value);
  }
}
</script>

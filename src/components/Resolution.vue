<template>
  <BaseDropdown
    :options="resolutionsToSelectOptions(resolutions)"
    :current-selection="resolutionsToSelectOptions([selectedResolution])[0]"
    :on-option-selected="handleResolutionSelected"
    v-if="!loadingResolutions"
    :grow="true"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseInput from "@/components/BaseInput.vue";
import BaseDropdown, { SelectOption } from "@/components/BaseDropdown.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { Resolution as ResolutionType } from "../main/resolution";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";

@Options({
  components: { BaseDropdown, BaseInput },
})
export default class Resolution extends Vue {
  private loadingResolutions = true;
  private selectedResolution!: ResolutionType;
  private resolutions!: ResolutionType[];

  async created() {
    this.resolutions = await this.getResolutions();

    this.setInitialResolution();
  }

  setInitialResolution() {
    logger.info("Attempting to set initial resolutions");

    const widthPreference = userPreferences.get(USER_PREFERENCE_KEYS.WIDTH);
    const heightPreference = userPreferences.get(USER_PREFERENCE_KEYS.HEIGHT);

    // If there is already a width and height selected, try to use that
    if (widthPreference && heightPreference) {
      logger.debug(`Height preference found: ${heightPreference}`);
      logger.debug(`Width preference found: ${widthPreference}`);

      this.selectedResolution =
        this.resolutions.find((resolution) => {
          return (
            resolution.height === heightPreference &&
            resolution.width === widthPreference
          );
        }) || this.resolutions[0];
    } else {
      [this.selectedResolution] = this.resolutions;
    }

    logger.debug(
      `Resolution set to ${this.selectedResolution.width} x ${this.selectedResolution.height}`
    );

    userPreferences.set(
      USER_PREFERENCE_KEYS.HEIGHT,
      this.selectedResolution.height
    );
    userPreferences.set(
      USER_PREFERENCE_KEYS.WIDTH,
      this.selectedResolution.width
    );
    this.loadingResolutions = false;
  }

  async getResolutions(): Promise<ResolutionType[]> {
    return ipcRenderer.invoke(IPCEvents.GET_RESOLUTIONS);
  }

  private resolutionsToSelectOptions(
    resolutions: ResolutionType[]
  ): SelectOption[] {
    return resolutions.map(({ height, width }) => ({
      text: `${width} x ${height}`,
      value: { width, height },
    }));
  }

  handleResolutionSelected({ value }: SelectOption) {
    const { height, width } = value as ResolutionType;
    userPreferences.set(USER_PREFERENCE_KEYS.HEIGHT, height);
    userPreferences.set(USER_PREFERENCE_KEYS.WIDTH, width);
  }
}
</script>

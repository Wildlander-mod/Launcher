<template>
  <BaseDropdown
    :options="resolutionsToSelectOptions(resolutions)"
    :current-selection="resolutionsToSelectOptions([selectedResolution])[0]"
    :on-option-selected="handleResolutionSelected"
    :show-tooltip="containsUltrawide"
    v-if="!loadingResolutions"
    :grow="true"
  >
    <div class="l-row">
      <span class="material-icons c-resolution__info-icon u-text"> info </span>
      <div>
        Ultra-widescreen resolutions are not supported.
        <BaseLink
          href="https://github.com/Wildlander-mod/Support/blob/master/Docs/SSEFAQ.md#does-this-pack-support-ultrawide-resolutions"
          :underline="true"
        >
          More info.
        </BaseLink>
      </div>
    </div>
  </BaseDropdown>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseInput from "@/components/BaseInput.vue";
import BaseDropdown, { SelectOption } from "@/components/BaseDropdown.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import {
  isUnsupportedResolution,
  Resolution as ResolutionType,
} from "../main/resolution";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { logger } from "@/main/logger";
import BaseLink from "@/components/BaseLink.vue";

@Options({
  components: { BaseLink, BaseDropdown, BaseInput },
})
export default class Resolution extends Vue {
  private loadingResolutions = true;
  private selectedResolution!: ResolutionType;
  private resolutions!: ResolutionType[];
  private containsUltrawide = false;

  async created() {
    this.resolutions = await this.getResolutions();

    this.setInitialResolution();
    this.containsUltrawide = !!this.resolutions.find(({ width, height }) => {
      return isUnsupportedResolution(width, height);
    });

    this.loadingResolutions = false;
  }

  setInitialResolution() {
    logger.info("Attempting to set initial resolutions");

    const resolutionPreference = userPreferences.get(
      USER_PREFERENCE_KEYS.RESOLUTION
    );

    // If there is already a width and height selected, try to use that
    if (resolutionPreference) {
      const { width, height } = resolutionPreference as ResolutionType;
      logger.debug(`Resolution preference: ${width}x${height}`);

      this.selectedResolution =
        this.resolutions.find(
          (resolution) =>
            resolution.height === height && resolution.width === width
        ) || this.getFirstSupportedResolution();
    } else {
      this.selectedResolution = this.getFirstSupportedResolution();
    }

    logger.debug(
      `Resolution set to ${this.selectedResolution.width} x ${this.selectedResolution.height}`
    );

    userPreferences.set(USER_PREFERENCE_KEYS.RESOLUTION, {
      width: this.selectedResolution.width,
      height: this.selectedResolution.height,
    });
  }

  getFirstSupportedResolution() {
    return this.resolutions.find(
      ({ width, height }) => !isUnsupportedResolution(width, height)
    ) as ResolutionType;
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
      disabled: isUnsupportedResolution(width, height),
    }));
  }

  handleResolutionSelected({ value }: SelectOption) {
    const { height, width } = value as ResolutionType;
    userPreferences.set(USER_PREFERENCE_KEYS.RESOLUTION, { height, width });
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-resolution__info-icon {
  font-size: $font-size;
  margin-right: $size-spacing--small;
}
</style>

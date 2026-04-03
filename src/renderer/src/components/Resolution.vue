<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <BaseDropdown
    v-if="resolutions !== null && selectedResolution !== null"
    :options="resolutions"
    :current-selection="selectedResolution"
    :show-tooltip-on-hover="true"
    :grow="true"
    data-testid="resolution-dropdown"
    @selected="onResolutionSelected"
  >
    <div class="l-row">
      <div v-if="containsUltrawide" data-testid="ultrawide-warning">
        <span class="material-icons c-resolution__info-icon u-text">
          info
        </span>
        <div>
          Ultra-widescreen resolutions are not supported in this modpack.
          <BaseLink
            href="https://github.com/Wildlander-mod/Support/wiki/FAQ#does-this-pack-support-ultrawide-resolutions"
            :underline="true"
          >
            More info.
          </BaseLink>
        </div>
      </div>
      <div>
        If your desired resolution has not been detected, go to the advanced tab
        and edit the launcher config.
      </div>
    </div>
  </BaseDropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseDropdown, { type SelectOption } from "./BaseDropdown.vue";
import type { Resolution as ResolutionType } from "@/shared/types/Resolution";
import BaseLink from "./BaseLink.vue";
import logger from "electron-log/renderer";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import { asyncFilter } from "@/shared/util/asyncFilter";
import { RESOLUTION_EVENTS } from "@/main/controllers/resolution/resolution.events";

function isResolutionType(value: unknown): value is ResolutionType {
  return (
    typeof value === "object" &&
    value !== null &&
    "width" in value &&
    "height" in value
  );
}

const emit = defineEmits<{
  "resolution-loading": [loading: boolean];
}>();

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const selectedResolution = ref<SelectOption | null>(null);
const resolutions = ref<SelectOption[] | null>(null);
const containsUltrawide = ref(false);

onMounted(async () => {
  const rawResolutions = await getResolutions();
  containsUltrawide.value =
    (
      await asyncFilter(rawResolutions, async ({ width, height }) => {
        return ipcService.invoke(RESOLUTION_EVENTS.IS_UNSUPPORTED_RESOLUTION, {
          width,
          height,
        });
      })
    ).length > 0;

  resolutions.value = await resolutionsToSelectOptions(rawResolutions);
  selectedResolution.value = (
    await resolutionsToSelectOptions([await getResolutionPreference()])
  )[0];
});

async function resolutionsToSelectOptions(
  resolutionList: ResolutionType[]
): Promise<SelectOption[]> {
  return Promise.all(
    resolutionList.map(async ({ height, width }) => ({
      text: `${width} x ${height}`,
      value: { width, height },
      disabled:
        (await ipcService.invoke(RESOLUTION_EVENTS.IS_UNSUPPORTED_RESOLUTION, {
          width,
          height,
        })) ?? false,
    }))
  );
}

async function getResolutionPreference(): Promise<ResolutionType> {
  return ipcService.invoke<ResolutionType>(
    RESOLUTION_EVENTS.GET_RESOLUTION_PREFERENCE
  );
}

async function getResolutions(): Promise<ResolutionType[]> {
  return ipcService.invoke(RESOLUTION_EVENTS.GET_RESOLUTIONS);
}

async function onResolutionSelected(option: SelectOption) {
  logger.debug(`User selected resolution ${JSON.stringify(option.value)}`);

  // Emit event to indicate resolution change is starting
  emit("resolution-loading", true);

  if (isResolutionType(option.value)) {
    await ipcService.invoke(RESOLUTION_EVENTS.SET_RESOLUTION_PREFERENCE, {
      height: option.value.height,
      width: option.value.width,
    });
  }
  selectedResolution.value = option;

  // Emit event to indicate resolution change is complete
  emit("resolution-loading", false);
}
</script>

<style scoped lang="scss">
@import "@/renderer/src/assets/scss/index";

.c-resolution__info-icon {
  margin-right: $size-spacing--small;
}
</style>

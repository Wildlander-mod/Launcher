<template>
  <BaseDropdown
    v-if="enbPresets !== null && selectedEnb !== null"
    :current-selection="selectedEnb"
    :options="enbPresets"
    :grow="true"
    :show-tooltip-on-hover="true"
    data-testid="enb-dropdown"
    @selected="onEnbChanged"
  >
    Uses GPU. Determines the quality of post-processing effects: ambient
    occlusion, sun rays, advanced lighting, and more.
  </BaseDropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseDropdown, { type SelectOption } from "./BaseDropdown.vue";
import type { NonEmptyArray } from "@/shared/types/non-empty-array";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import type { FriendlyDirectoryMap } from "@/shared/types/modpack-metadata";
import { ENB_EVENTS } from "@/main/controllers/enb/enb.events";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "../services/event.service";
import logger from "electron-log/renderer";

const emit = defineEmits<{
  "enb-loading": [loading: boolean];
}>();

const eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const selectedEnb = ref<SelectOption | null>(null);
const enbPresets = ref<NonEmptyArray<SelectOption> | null>(null);

onMounted(async () => {
  enbPresets.value = directoryMapToSelectOptions(await getEnbPresets());
  selectedEnb.value = await getInitialEnb(enbPresets.value);
});

async function getInitialEnb(
  enbs: NonEmptyArray<SelectOption>
): Promise<SelectOption> {
  const enbPreference = await ipcService.invoke(ENB_EVENTS.GET_ENB_PREFERENCE);
  return enbs.find((enb) => enb.value === enbPreference) ?? enbs[0];
}

async function getEnbPresets(): Promise<FriendlyDirectoryMap[]> {
  return [
    ...(await ipcService.invoke<FriendlyDirectoryMap[]>(
      ENB_EVENTS.GET_ENB_PRESETS
    )),
  ];
}

function directoryMapToSelectOptions(
  directoryMap: FriendlyDirectoryMap[]
): SelectOption[] {
  return directoryMap.map(({ friendly, real }) => ({
    text: friendly,
    value: real,
  }));
}

async function onEnbChanged(option: SelectOption) {
  logger.debug(`User selected enb ${option.value}`);
  eventService.emit(ENABLE_LOADING_EVENT);
  emit("enb-loading", true);

  if (option.value !== selectedEnb.value?.value) {
    await ipcService.invoke(ENB_EVENTS.SET_ENB_PREFERENCE, option.value);
    selectedEnb.value = option;
  }

  emit("enb-loading", false);
  eventService.emit(DISABLE_LOADING_EVENT);
}
</script>

<template>
  <BaseDropdown
    v-if="graphics !== null && selectedGraphics !== null"
    :current-selection="selectedGraphics"
    :options="graphics"
    :grow="true"
    :show-tooltip-on-hover="true"
    data-testid="graphics-dropdown"
    @selected="onGraphicsSelected"
  >
    Uses CPU and GPU. Determines the draw distance and quality of objects,
    lighting, shadows, and grass.
  </BaseDropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseDropdown, { type SelectOption } from "./BaseDropdown.vue";
import type { FriendlyDirectoryMap } from "../../../shared/types/modpack-metadata";
import logger from "electron-log/renderer";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import { GRAPHICS_EVENTS } from "../../../main/controllers/graphics/graphics.events";

const emit = defineEmits<{
  "graphics-loading": [loading: boolean];
}>();

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const selectedGraphics = ref<SelectOption | null>(null);
const graphics = ref<SelectOption[] | null>(null);

onMounted(async () => {
  graphics.value = await getGraphics();
  selectedGraphics.value = (await getInitialGraphics(graphics.value)) ?? null;
});

async function onGraphicsSelected(option: SelectOption) {
  logger.debug(`User selected graphics ${option.value}`);

  emit("graphics-loading", true);

  await ipcService.invoke(GRAPHICS_EVENTS.SET_GRAPHICS, option.value);
  selectedGraphics.value = option;

  emit("graphics-loading", false);
}

async function getInitialGraphics(graphicsList: SelectOption[]) {
  const graphicsPreference = await ipcService.invoke(
    GRAPHICS_EVENTS.GET_GRAPHICS_PREFERENCE
  );

  return (
    graphicsList.find((selection) => selection.value === graphicsPreference) ??
    graphicsList[0]
  );
}

async function getGraphics() {
  return (
    await ipcService.invoke<FriendlyDirectoryMap[]>(
      GRAPHICS_EVENTS.GET_GRAPHICS
    )
  ).map(({ friendly, real }) => ({
    text: friendly,
    value: real,
  }));
}
</script>

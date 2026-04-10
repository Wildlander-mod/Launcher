<template>
  <div data-testid="mod-directory" class="l-column">
    <BaseLabel :label="label" />
    <AppDropdownFileSelect
      v-if="modpacks"
      data-testid="mod-directory-select"
      :options="modpacks"
      :current-selection="modDirectory"
      default-text="Select mod directory..."
      @file-selected="modDirectorySet"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import type { SelectOption } from "./BaseDropdown.vue";
import BaseLabel from "./BaseLabel.vue";
import { WildlanderModpack } from "../../../shared/wildlander/modpack";
import { MODPACK_EVENTS } from "../../../main/controllers/modpack/mopack.events";
import { WABBAJACK_EVENTS } from "../../../main/controllers/wabbajack/wabbajack.events";
import { WINDOW_EVENTS } from "../../../main/controllers/window/window.events";
import { ENABLE_LOADING_EVENT } from "../services/event.service";
import AppDropdownFileSelect from "./AppDropdownFileSelect.vue";

withDefaults(defineProps<{ label?: string }>(), {
  label: `${WildlanderModpack.name} installation folder`,
});

const eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
const messageService = injectStrict(SERVICE_BINDINGS.MESSAGE_SERVICE);
const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);
const modpackService = injectStrict(SERVICE_BINDINGS.MODPACK_SERVICE);

const modDirectory = ref<SelectOption | null>(null);
const modpacks = ref<SelectOption[] | null>(null);

onMounted(async () => {
  modDirectory.value = await getCurrentModDirectory();

  const installedModpacks = await getInstalledModpacks();

  if (
    modDirectory.value !== null &&
    typeof modDirectory.value.value === "string" &&
    !installedModpacks.includes(modDirectory.value.value)
  ) {
    installedModpacks.push(modDirectory.value.value);
  }
  modpacks.value = convertModpackPathsToOptions(installedModpacks);
});

async function getCurrentModDirectory(): Promise<SelectOption | null> {
  const modpack = await modpackService.getModpackDirectory();
  return modpack ? convertModpackToOption(modpack) : null;
}

async function getInstalledModpacks(): Promise<string[]> {
  return ipcService.invoke<string[]>(WABBAJACK_EVENTS.GET_INSTALLED_MODPACKS);
}

function convertModpackPathsToOptions(modpackPaths: string[]): SelectOption[] {
  return modpackPaths.map(convertModpackToOption);
}

function convertModpackToOption(modpack: string): SelectOption {
  return { text: modpack, value: modpack };
}

async function checkModDirectoryIsValid(filepath: string): Promise<boolean> {
  const { ok: modDirectoryOkay, missingPaths } =
    await modpackService.isModDirectoryValid(filepath);

  if (!modDirectoryOkay) {
    await triggerError(missingPaths);
    return false;
  }
  return true;
}

async function modDirectorySet(filepath: unknown) {
  if (
    typeof filepath === "string" &&
    (await checkModDirectoryIsValid(filepath))
  ) {
    eventService.emit(ENABLE_LOADING_EVENT);
    await ipcService.invoke(MODPACK_EVENTS.SET_MODPACK, filepath);
    modDirectory.value = { text: filepath, value: filepath };
    await ipcService.invoke(WINDOW_EVENTS.RELOAD);
  }
}

async function triggerError(missingPaths?: string[]) {
  const missingPathsError = missingPaths
    ? `Missing files/directories: ${JSON.stringify(missingPaths)
        .replace("[", "")
        .replace("]", "")}`
    : "";
  await messageService.error({
    title: "Invalid modpack directory selected",
    error: `Please ensure this is a valid modpack installation directory. Remember, this is NOT the Skyrim directory, it is the mod's installation directory. ${missingPathsError}`,
  });
}
</script>

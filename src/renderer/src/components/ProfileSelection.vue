<template>
  <BaseDropdown
    v-if="profiles !== null && selectedProfile !== null"
    :current-selection="selectedProfile"
    :options="profiles"
    :grow="true"
    :show-tooltip-on-hover="true"
    data-testid="profile-dropdown"
    @selected="onProfileSelected"
    @click="checkIfShowingHiddenProfiles"
  >
    Uses CPU and GPU. Determines the quality of visual mods, like textures and
    models. Gameplay is not affected.
  </BaseDropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseDropdown, { type SelectOption } from "./BaseDropdown.vue";
import type { FriendlyDirectoryMap } from "@/shared/types/modpack-metadata";
import logger from "electron-log/renderer";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import { PROFILE_EVENTS } from "@/main/controllers/profile/profile.events";

interface SelectOptionWithHiddenDefault extends SelectOption {
  hiddenByDefault: boolean;
}

const emit = defineEmits<{
  "profile-loading": [loading: boolean];
}>();

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const selectedProfile = ref<SelectOption | null>(null);
const profiles = ref<SelectOptionWithHiddenDefault[] | null>(null);

onMounted(async () => {
  profiles.value = await getProfiles();
  selectedProfile.value = (await getInitialProfile(profiles.value)) ?? null;
});

async function onProfileSelected(option: SelectOption) {
  logger.debug(`User selected profile ${option.value}`);

  emit("profile-loading", true);

  await ipcService.invoke(PROFILE_EVENTS.SET_PROFILE_PREFERENCE, option.value);
  selectedProfile.value = option;

  emit("profile-loading", false);
}

async function getInitialProfile(profileList: SelectOption[]) {
  const profilePreference = await ipcService.invoke(
    PROFILE_EVENTS.GET_PROFILE_PREFERENCE
  );

  return (
    profileList.find((profile) => profile.value === profilePreference) ??
    profileList[0]
  );
}

async function getProfiles(): Promise<SelectOptionWithHiddenDefault[]> {
  return (
    await ipcService.invoke<FriendlyDirectoryMap[]>(PROFILE_EVENTS.GET_PROFILES)
  ).map(({ friendly, real, hidden }) => ({
    text: friendly,
    value: real,
    hidden,
    hiddenByDefault: hidden,
  }));
}

async function checkIfShowingHiddenProfiles() {
  const showHiddenProfiles = await ipcService.invoke(
    PROFILE_EVENTS.GET_SHOW_HIDDEN_PROFILES
  );

  profiles.value =
    profiles.value &&
    profiles.value.map((profile) => ({
      ...profile,
      hidden: showHiddenProfiles ? false : profile.hiddenByDefault,
    }));
}
</script>

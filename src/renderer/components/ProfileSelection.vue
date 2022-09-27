<template>
  <BaseDropdown
    :current-selection="selectedProfile"
    :options="profiles"
    :grow="true"
    :show-tooltip-on-hover="true"
    v-if="profiles !== null && selectedProfile !== null"
    @selected="onProfileSelected"
  >
    Determines the draw distance of grass and shadows, the number of effects
    visible at once, and the quality of distant objects. These elements use a
    mix of CPU and GPU.
  </BaseDropdown>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseDropdown, {
  SelectOption,
} from "@/renderer/components/BaseDropdown.vue";
import { FriendlyDirectoryMap } from "@/modpack-metadata";
import { logger } from "@/main/logger";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { PROFILE_EVENTS } from "@/main/controllers/profile/profile.events";

@Options({
  components: { BaseDropdown },
})
export default class ProfileSelection extends Vue {
  selectedProfile: SelectOption | null = null;
  profiles: SelectOption[] | null = null;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  async created() {
    this.profiles = await this.getProfiles();
    this.selectedProfile = await this.getInitialProfile(this.profiles);
  }

  onProfileSelected(option: SelectOption) {
    logger.debug(`User selected profile ${option.value}`);
    this.ipcService.invoke(PROFILE_EVENTS.SET_PROFILE_PREFERENCE, option.value);
    this.selectedProfile = option;
  }

  async getInitialProfile(profiles: SelectOption[]) {
    const profilePreference = await this.ipcService.invoke(
      PROFILE_EVENTS.GET_PROFILE_PREFERENCE
    );

    return (
      profiles.find((profile) => profile.value === profilePreference) ??
      profiles[0]
    );
  }

  async getProfiles() {
    return (
      (await this.ipcService.invoke(
        PROFILE_EVENTS.GET_PROFILES
      )) as FriendlyDirectoryMap[]
    ).map(({ friendly, real }) => ({
      text: friendly,
      value: real,
    }));
  }
}
</script>

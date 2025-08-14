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

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseDropdown, { SelectOption } from "./BaseDropdown.vue";
import type { FriendlyDirectoryMap } from "@/shared/types/modpack-metadata";
import logger from "electron-log/renderer";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import { PROFILE_EVENTS } from "@/main/controllers/profile/profile.events";

interface SelectOptionWithHiddenDefault extends SelectOption {
  hiddenByDefault: boolean;
}

@Options({
  components: { BaseDropdown },
})
export default class ProfileSelection extends Vue {
  selectedProfile: SelectOption | null = null;
  profiles: SelectOptionWithHiddenDefault[] | null = null;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  override async created() {
    this.profiles = await this.getProfiles();
    this.selectedProfile =
      (await this.getInitialProfile(this.profiles)) ?? null;
  }

  async onProfileSelected(option: SelectOption) {
    logger.debug(`User selected profile ${option.value}`);

    this.$emit("profile-loading", true);

    await this.ipcService.invoke(
      PROFILE_EVENTS.SET_PROFILE_PREFERENCE,
      option.value
    );
    this.selectedProfile = option;

    this.$emit("profile-loading", false);
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
    ).map(
      ({ friendly, real, hidden }) =>
        ({
          text: friendly,
          value: real,
          hidden,
          hiddenByDefault: hidden,
        } as SelectOptionWithHiddenDefault)
    );
  }

  async checkIfShowingHiddenProfiles() {
    const showHiddenProfiles = await this.ipcService.invoke(
      PROFILE_EVENTS.GET_SHOW_HIDDEN_PROFILES
    );

    this.profiles =
      this.profiles &&
      this.profiles.map((profile) => {
        return {
          ...profile,
          hidden: showHiddenProfiles ? false : profile.hiddenByDefault,
        };
      });
  }
}
</script>

<template>
  <BaseDropdown
    :current-selection="this.selectedENB"
    :options="ENBPresets"
    :on-option-selected="handleENBPresetChanged"
    v-if="!loadingENBPresets"
    :grow="true"
    :show-tooltip-on-hover="true"
  >
    Determines the quality of environment lighting, particle lighting, ambient
    occlusion, sun rays, and other post-processing effects. These elements are
    very heavy on the GPU.
  </BaseDropdown>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseButton from "@/components/BaseButton.vue";
import { IPCEvents } from "@/enums/IPCEvents";
import { ipcRenderer } from "electron";
import BaseDropdown, { SelectOption } from "@/components/BaseDropdown.vue";
import { modpack, USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import BaseLink from "@/components/BaseLink.vue";
import {
  EventService,
  injectStrict,
  SERVICE_BINDINGS,
} from "@/services/service-container";
import { FriendlyDirectoryMap, Modpack } from "@/modpack-metadata";
import { logger } from "@/main/logger";

@Options({
  components: { BaseLink, BaseDropdown, BaseButton },
})
export default class ENB extends Vue {
  private selectedENB: SelectOption = { text: "", value: "" };
  private ENBPresets = [this.selectedENB];
  private loadingENBPresets = true;
  private modpack!: Modpack;

  eventService!: EventService;

  async created() {
    this.eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);

    this.modpack = modpack;

    this.ENBPresets = await this.getENBPresets();

    this.setInitialENB();

    this.loadingENBPresets = false;
  }

  setInitialENB() {
    const ENBPreference = userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE);

    this.selectedENB = ENBPreference
      ? this.ENBPresets.find((ENB) => ENB.value === ENBPreference) ??
        this.ENBPresets[0]
      : this.ENBPresets[0];

    logger.debug(`Setting initial ENB to ${this.selectedENB.text}`);

    userPreferences.set(
      USER_PREFERENCE_KEYS.ENB_PROFILE,
      this.selectedENB.value
    );
  }

  async getENBPresets(): Promise<SelectOption[]> {
    return [
      ...(
        (await ipcRenderer.invoke(
          IPCEvents.GET_ENB_PRESETS
        )) as FriendlyDirectoryMap[]
      ).map(({ friendly, real }) => ({
        text: friendly,
        value: real,
      })),
      {
        text: "No ENB",
        value: "noENB",
      },
    ];
  }

  async handleENBPresetChanged(profile: SelectOption) {
    userPreferences.set(USER_PREFERENCE_KEYS.ENB_PROFILE, profile.value);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.l-spacing-rights:not(:last-child) {
  margin-bottom: $size-spacing--large;
}
</style>

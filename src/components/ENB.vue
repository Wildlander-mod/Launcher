<template>
  <div class="l-column">
    <div class="l-row l-spacing-rights">
      <BaseDropdown
        class="l-spacing-right"
        :current-selection="this.selectedENB"
        :options="ENBPresets"
        :on-option-selected="handleENBPresetChanged"
        v-if="!loadingENBPresets"
      />

      <div class="l-center-vertically">
        ENB preset (setting will not take effect until files are copied)
      </div>
    </div>

    <div class="l-row l-no-flex-grow l-spacing-rights">
      <BaseButton
        class="l-spacing-right"
        size="large"
        type="primary"
        @click="handleCopyENBFiles"
      >
        Copy ENB files
      </BaseButton>
      <div class="l-center-vertically">
        <p>
          Copy all {{ modpack.name }} ENB files to the local Skyrim directory
        </p>
      </div>
    </div>

    <div class="l-row l-no-flex-grow l-spacing-rights">
      <BaseButton
        class="l-spacing-right"
        size="large"
        type="warning"
        @click="handleDeleteENBFiles"
      >
        Delete all ENB files
      </BaseButton>
      <div class="l-center-vertically">
        <p>
          Delete all {{ modpack.name }} ENB files from the local Skyrim
          directory
        </p>
      </div>
    </div>
  </div>
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
import {
  DISABLE_ACTIONS_EVENT,
  DISABLE_LOADING_EVENT,
  ENABLE_ACTIONS_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/App.vue";
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

  async handleCopyENBFiles() {
    this.eventService.emit(DISABLE_ACTIONS_EVENT);
    this.eventService.emit(ENABLE_LOADING_EVENT);

    const { response } = await ipcRenderer.invoke(IPCEvents.CONFIRMATION, {
      message:
        "Copying ENB files will overwrite any ENB files in the Skyrim directory. Are you sure?",
      buttons: ["Cancel", "Copy ENB files"],
    });

    if (response === 1) {
      try {
        await ipcRenderer.invoke(IPCEvents.COPY_ENB_FILES);
      } catch (error) {
        await ipcRenderer.invoke(IPCEvents.ERROR, {
          title: "Error copying ENB files",
          error: (error as Error).message,
        });
      }
    }

    this.eventService.emit(DISABLE_LOADING_EVENT);
    this.eventService.emit(ENABLE_ACTIONS_EVENT);
  }

  async handleDeleteENBFiles() {
    this.eventService.emit(DISABLE_ACTIONS_EVENT);
    this.eventService.emit(ENABLE_LOADING_EVENT);

    const { response } = await ipcRenderer.invoke(IPCEvents.CONFIRMATION, {
      message:
        "Deleting ENB files will delete any ENB files in the Skyrim directory from all presets. Are you sure?",
      buttons: ["Cancel", "Delete ENB files"],
    });

    if (response === 1) {
      try {
        await ipcRenderer.invoke(IPCEvents.DELETE_ALL_ENB_FILES);
      } catch (error) {
        await ipcRenderer.invoke(IPCEvents.ERROR, {
          title: "Error deleting ENB files",
          error: (error as Error).message,
        });
      }
    }

    this.eventService.emit(DISABLE_LOADING_EVENT);
    this.eventService.emit(ENABLE_ACTIONS_EVENT);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.l-spacing-rights:not(:last-child) {
  margin-bottom: $size-spacing--large;
}
</style>

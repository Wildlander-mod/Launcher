<template>
  <AppPage>
    <AppPageContent width="large">
      <div class="c-settings l-column">
        <div class="c-settings__directories l-row l-space-between">
          <ModDirectory />
        </div>

        <div class="l-row c-settings__actions">
          <div class="c-settings__label">Mod Organizer 2</div>
          <BaseButton type="primary" @click="launchMO2"> Launch</BaseButton>
        </div>

        <div class="l-row c-settings__actions">
          <div class="c-settings__label">Restore ENB presets</div>
          <BaseButton type="warning" @click="restoreENBPresets"
            >Restore
          </BaseButton>
        </div>
        <div class="l-row c-settings__actions">
          <div class="c-settings__label">Restore MO2 profiles</div>
          <BaseButton type="warning" @click="restoreProfiles"
            >Restore
          </BaseButton>
        </div>
        <div class="l-row c-settings__actions">
          <div class="c-settings__label">Application logs</div>
          <BaseButton type="default" @click="openLogPath"> Open</BaseButton>
        </div>
        <div class="l-row c-settings__actions">
          <div class="c-settings__label">Skyrim crash logs</div>
          <BaseButton type="default" @click="openCrashLogPath">
            Open
          </BaseButton>
        </div>
      </div>
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import BaseButton from "@/components/BaseButton.vue";
import AppFileSelect from "@/components/AppFileSelect.vue";
import { ipcRenderer, shell } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import ModDirectory from "@/components/ModDirectory.vue";
import { logger } from "@/main/logger";
import path from "path";
import {
  DISABLE_ACTIONS_EVENT,
  DISABLE_LOADING_EVENT,
  ENABLE_ACTIONS_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/App.vue";
import {
  EventService,
  injectStrict,
  SERVICE_BINDINGS,
} from "@/services/service-container";

@Options({
  components: {
    ModDirectory,
    AppFileSelect,
    AppPage,
    AppPageContent,
    BaseButton,
  },
})
export default class Settings extends Vue {
  private eventService!: EventService;

  created() {
    this.eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
  }

  async launchMO2() {
    if (
      userPreferences.has(USER_PREFERENCE_KEYS.MOD_DIRECTORY) &&
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY) !== ""
    ) {
      this.eventService.emit(DISABLE_ACTIONS_EVENT);
      this.eventService.emit(ENABLE_LOADING_EVENT);

      await ipcRenderer.invoke(IPCEvents.LAUNCH_MO2);

      this.eventService.emit(ENABLE_ACTIONS_EVENT);
      this.eventService.emit(DISABLE_LOADING_EVENT);
    } else {
      await ipcRenderer.invoke(
        IPCEvents.MESSAGE,
        "No mod directory specified, please select one on the settings tab."
      );
    }
  }

  async restoreENBPresets() {
    this.eventService.emit(DISABLE_ACTIONS_EVENT);
    this.eventService.emit(ENABLE_LOADING_EVENT);

    const { response } = await ipcRenderer.invoke(IPCEvents.CONFIRMATION, {
      message:
        "Restoring ENB presets will reset any changes you have made to any ENBs. This cannot be undone. Are you sure?",
      buttons: ["Cancel", "Restore ENB presets"],
    });

    if (response === 1) {
      try {
        await ipcRenderer.invoke(IPCEvents.RESTORE_ENB_PRESETS);
      } catch (error) {
        await ipcRenderer.invoke(IPCEvents.ERROR, {
          title: "Error restoring ENB files",
          error: (error as Error).message,
        });
      }
    }

    this.eventService.emit(ENABLE_ACTIONS_EVENT);
    this.eventService.emit(DISABLE_LOADING_EVENT);
  }

  async restoreProfiles() {
    this.eventService.emit(DISABLE_ACTIONS_EVENT);
    this.eventService.emit(ENABLE_LOADING_EVENT);

    const { response } = await ipcRenderer.invoke(IPCEvents.CONFIRMATION, {
      message:
        "Restoring MO2 profiles will reset any changes you have made to any profiles. This cannot be undone. Are you sure?",
      buttons: ["Cancel", "Restore MO2 profiles"],
    });

    if (response === 1) {
      try {
        await ipcRenderer.invoke(IPCEvents.RESTORE_MO2_PROFILES);
      } catch (error) {
        await ipcRenderer.invoke(IPCEvents.ERROR, {
          title: "Error restoring MO2 profiles",
          error: (error as Error).message,
        });
      }
    }

    this.eventService.emit(ENABLE_ACTIONS_EVENT);
    this.eventService.emit(DISABLE_LOADING_EVENT);
  }

  openLogPath() {
    const logPath = path.parse(logger.transports?.file.findLogPath()).dir;
    shell.openPath(logPath);
  }

  async openCrashLogPath() {
    const crashLogPath = path.join(
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY),
      "/overwrite/NetScriptFramework/Crash"
    );
    if (
      await ipcRenderer.invoke(IPCEvents.CHECK_IF_FILE_EXISTS, crashLogPath)
    ) {
      await shell.openPath(crashLogPath);
    } else {
      await ipcRenderer.invoke(IPCEvents.ERROR, {
        title: "Error while opening crash logs folder",
        error: `Crash logs directory at ${crashLogPath} does not exist. This likely means you do not have any crash logs.`,
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-settings {
  line-height: $line-height__body;
}

.c-settings__directories {
  border-bottom: 1px solid $colour-background--light;
  margin-bottom: $size-spacing;
  padding-bottom: $size-spacing;

  :first-child {
    margin-right: $size-spacing;
  }
}

.c-settings__actions {
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: $size-spacing;

  width: 40%;
}

.c-settings__label {
  margin-right: $size-spacing;
}
</style>

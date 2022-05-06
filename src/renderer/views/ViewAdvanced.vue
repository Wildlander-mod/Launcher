<template>
  <AppPage>
    <AppPageContent width="large">
      <div class="c-settings l-column">
        <div class="c-settings__directories l-column">
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
import AppPage from "@/renderer/components/AppPage.vue";
import AppPageContent from "@/renderer/components/AppPageContent.vue";
import BaseButton from "@/renderer/components/BaseButton.vue";
import ModDirectory from "@/renderer/components/ModDirectory.vue";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { ENB_EVENTS } from "@/main/controllers/enb/enb.events";
import { MOD_ORGANIZER_EVENTS } from "@/main/controllers/modOrganizer/modOrganizer.events";
import { SYSTEM_EVENTS } from "@/main/controllers/system/system.events";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/renderer/services/event.service";

@Options({
  components: {
    ModDirectory,
    AppPage,
    AppPageContent,
    BaseButton,
  },
})
export default class Settings extends Vue {
  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
  private messageService = injectStrict(SERVICE_BINDINGS.MESSAGE_SERVICE);
  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  async launchMO2() {
    this.eventService.emit(ENABLE_LOADING_EVENT);
    try {
      await this.ipcService.invoke(MOD_ORGANIZER_EVENTS.LAUNCH_MO2);
    } catch (error) {
      await this.messageService.error({
        title: "Failed to launch MO2",
        error: (error as Error).message,
      });
    }
    this.eventService.emit(DISABLE_LOADING_EVENT);
  }

  async restoreENBPresets() {
    this.eventService.emit(ENABLE_LOADING_EVENT);

    const { response } = await this.messageService.confirmation(
      "Restoring ENB presets will reset any changes you have made to any ENBs. This cannot be undone. Are you sure?",
      ["Cancel", "Restore ENB presets"]
    );
    if (response === 1) {
      try {
        await this.ipcService.invoke(ENB_EVENTS.RESTORE_ENB_PRESETS);
      } catch (error) {
        await this.messageService.error({
          title: "Error restoring ENB files",
          error: (error as Error).message,
        });
      }
    }

    this.eventService.emit(DISABLE_LOADING_EVENT);
  }

  async restoreProfiles() {
    this.eventService.emit(ENABLE_LOADING_EVENT);

    const { response } = await this.messageService.confirmation(
      "Restoring MO2 profiles will reset any changes you have made to any profiles. This cannot be undone. Are you sure?",
      ["Cancel", "Restore MO2 profiles"]
    );

    if (response === 1) {
      try {
        await this.ipcService.invoke(MOD_ORGANIZER_EVENTS.RESTORE_PROFILES);
      } catch (error) {
        await this.messageService.error({
          title: "Error restoring MO2 profiles",
          error: (error as Error).message,
        });
      }
    }

    this.eventService.emit(DISABLE_LOADING_EVENT);
  }

  async openLogPath() {
    await this.ipcService.invoke(SYSTEM_EVENTS.OPEN_APPLICATION_LOGS);
  }

  async openCrashLogPath() {
    await this.ipcService.invoke(SYSTEM_EVENTS.OPEN_CRASH_LOGS);
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
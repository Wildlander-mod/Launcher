<template>
  <AppPage>
    <AppPageContent title="Tools" width="large">
      <div class="l-column">
        <ButtonWithDescription
          :action="openWabbajack"
          button-text="Launch"
          description="Wabbajack"
        />

        <ButtonWithDescription
          :action="launchMO2"
          button-text="Launch"
          description="Mod Organiser 2"
        />
      </div>
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "../components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import BaseButton from "@/components/BaseButton.vue";
import ButtonWithDescription from "@/components/ButtonWithDescription.vue";
import { logger } from "@/main/logger";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
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
  components: { ButtonWithDescription, BaseButton, AppPageContent, AppPage },
})
export default class ViewTools extends Vue {
  private eventService!: EventService;

  created() {
    this.eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
  }

  async openWabbajack() {
    logger.info("Open Wabbajack");
    await ipcRenderer.invoke(IPCEvents.RUN_WABBAJACK);
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
}
</script>

<style scoped lang="scss"></style>

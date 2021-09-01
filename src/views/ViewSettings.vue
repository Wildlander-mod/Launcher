<template>
  <AppPage>
    <AppPageContent title="Settings" width="large">
      <div class="c-settings l-column">
        <div class="c-settings__directories l-row l-space-between">
          <ModDirectory />
          <SkyrimDirectory />
        </div>

        <div class="l-row c-settings__actions">
          <div class="c-settings__launchMO-label">Mod Organiser 2</div>
          <BaseButton type="primary" @click="launchMO2"> Launch </BaseButton>
        </div>

        <div class="l-row c-settings__actions">
          <div class="c-settings__launchMO-label">Application logs</div>
          <BaseButton type="default" @click="openLogPath"> Open </BaseButton>
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
import SkyrimDirectory from "@/components/SkyrimDirectory.vue";

@Options({
  components: {
    SkyrimDirectory,
    ModDirectory,
    AppFileSelect,
    AppPage,
    AppPageContent,
    BaseButton,
  },
})
export default class Settings extends Vue {
  launchMO2() {
    if (
      userPreferences.has(USER_PREFERENCE_KEYS.MOD_DIRECTORY) &&
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY) !== ""
    ) {
      ipcRenderer.invoke(IPCEvents.LAUNCH_MO2);
    } else {
      ipcRenderer.invoke(
        IPCEvents.MESSAGE,
        "No mod directory specified, please select one on the settings tab."
      );
    }
  }

  openLogPath() {
    const logPath = path.parse(logger.transports?.file.findLogPath()).dir;
    shell.openPath(logPath);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-settings {
  font-size: $font-size--body;
  line-height: $line-height__body;

  width: 100%;
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

.c-settings__launchMO-label {
  margin-right: $size-spacing;
}
</style>

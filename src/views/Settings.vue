<template>
  <Page>
    <PageContent title="Settings" width="large">
      <div class="c-settings l-column">
        <div class="c-settings__directories l-row l-space-between">
          <ModDirectory />
        </div>

        <div class="l-row c-settings__launchMO">
          <div class="c-settings__launchMO-label">ModOrganiser 2</div>
          <Button type="primary" @click="launchMO2">
            Launch
          </Button>
        </div>
      </div>
    </PageContent>
  </Page>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Page from "@/components/Page.vue";
import PageContent from "@/components/PageContent.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import Button from "@/components/controls/Button.vue";
import FileSelect from "@/components/FileSelect.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import ModDirectory from "@/components/ModDirectory.vue";

@Options({
  components: {
    ModDirectory,
    FileSelect,
    Page,
    PageContent,
    Button
  }
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

.c-settings__launchMO {
  flex: 1;
  flex-direction: row;
  align-items: center;
  margin-top: $size-spacing;
}

.c-settings__launchMO-label {
  margin-right: $size-spacing;
}
</style>

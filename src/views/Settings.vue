<template>
  <Page>
    <PageContent title="Settings" width="large">
      <div class="c-settings l-column">
        <div class="c-settings__directories l-row l-space-between">
          <FileSelect
            :on-file-path-change="onSkyrimDirectoryChange"
            :initial-file-path="initialSkyrimDirectory"
            :clear-file-path-prop="clearSkyrimDirectory"
            label="Skyrim Directory"
          />
          <FileSelect
            :on-file-path-change="onModDirectoryChange"
            :initial-file-path="initialModDirectory"
            :clear-file-path-prop="clearModDirectory"
            label="Ultimate Skyrim Directory"
          />
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
import { Options as Component, Vue } from "vue-class-component";
import Page from "@/components/Page.vue";
import PageContent from "@/components/PageContent.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import Button from "@/components/controls/Button.vue";
import FileSelect from "@/components/FileSelect.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";

@Component({
  components: {
    FileSelect,
    Page,
    PageContent,
    Button
  }
})
export default class Settings extends Vue {
  private initialSkyrimDirectory!: string;
  private initialModDirectory!: string;

  created() {
    this.initialSkyrimDirectory =
      userPreferences.get(USER_PREFERENCE_KEYS.GAME_DIRECTORY) ?? "";
    this.initialModDirectory =
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY) ?? "";
  }

  onSkyrimDirectoryChange(filepath: string) {
    userPreferences.set(USER_PREFERENCE_KEYS.GAME_DIRECTORY, filepath);
  }

  clearSkyrimDirectory() {
    userPreferences.delete(USER_PREFERENCE_KEYS.GAME_DIRECTORY);
  }

  onModDirectoryChange(filepath: string) {
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, filepath);
  }

  clearModDirectory() {
    userPreferences.delete(USER_PREFERENCE_KEYS.MOD_DIRECTORY);
  }

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

<template>
  <Page>
    <PageContent title="Settings" width="large">
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
}
</script>

<style scoped lang="scss"></style>

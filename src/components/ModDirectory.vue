<template>
  <FileSelect
    :on-file-path-change="onModDirectoryChange"
    :initial-file-path="initialModDirectory"
    label="Ultimate Skyrim Directory"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import FileSelect from "@/components/FileSelect.vue";

export const filepathSetEvent = "filepathSet";

@Options({
  components: { FileSelect }
})
export default class ModDirectory extends Vue {
  private initialModDirectory!: string;

  created() {
    this.initialModDirectory =
      userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY) ?? "";
    if (this.initialModDirectory) {
      this.$emit(filepathSetEvent);
    }
  }

  onModDirectoryChange(filepath: string) {
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, filepath);
    this.$emit(filepathSetEvent);
  }
}
</script>

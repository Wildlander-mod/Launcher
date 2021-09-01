<template>
  <div class="l-column c-game-folder-files">
    <div class="l-column c-game-files">
      <div class="l-row c-game-files__copy">
        <BaseButton
          class="c-game-folder-files__action"
          size="large"
          type="primary"
          @click="handleCopyGameFiles"
        >
          Copy game files
        </BaseButton>
        <div class="l-flex l-center">
          <p>
            Copy all Ultimate Skyrim game files (not enb files) to the Skyrim
            directory
          </p>
        </div>
      </div>
      <div class="l-row">
        <BaseButton
          class="c-game-folder-files__action"
          size="large"
          type="warning"
          @click="handleDeleteGameFiles"
        >
          Delete game files
        </BaseButton>
        <div class="l-flex l-center">
          <p>
            Delete all Ultimate Skyrim game files (not enb files) from the
            Skyrim directory
          </p>
        </div>
      </div>
    </div>
    <div class="l-column c-enb-files">
      <div class="l-row c-enb-files-copy">
        <BaseButton
          class="c-game-folder-files__action"
          size="large"
          type="primary"
        >
          Copy enb files
        </BaseButton>
        <div class="l-flex l-center">
          <p>Copy all Ultimate Skyrim enb files to the Skyrim directory</p>
        </div>
      </div>
      <div class="l-row">
        <BaseButton
          class="c-game-folder-files__action"
          size="large"
          type="warning"
        >
          Delete enb files
        </BaseButton>
        <div class="l-flex l-center">
          <p>Delete all Ultimate Skyrim enb files from the Skyrim directory</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseButton from "@/components/BaseButton.vue";
import { IPCEvents } from "@/enums/IPCEvents";
import { ipcRenderer } from "electron";

@Options({
  components: { BaseButton },
})
export default class GameFolderFiles extends Vue {
  async handleCopyGameFiles() {
    await ipcRenderer.invoke(IPCEvents.COPY_GAME_FILES);
  }
  async handleDeleteGameFiles() {
    await ipcRenderer.invoke(IPCEvents.DELETE_GAME_FILES);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-game-folder-files {
  width: 100%;
}

.c-game-files {
  border-bottom: 1px solid $colour-background--light;

  padding-bottom: $size-spacing--large;
}

.c-game-folder-files__action {
  margin-right: $size-spacing;
}

.c-game-files__copy,
.c-enb-files-copy {
  margin-bottom: $size-spacing;
}

.c-enb-files {
  margin-top: $size-spacing--large;
}
</style>

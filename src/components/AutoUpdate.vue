<template>
  <AppModal :show-modal="showAutoUpdate" name="autoUpdate">
    <div class="l-column l-center">
      <template v-if="updateAvailable">
        <p>There is a new version of the launcher available.</p>
        <p>
          The application will restart and automatically apply the update before
          continuing.
        </p>

        <p v-if="!updateDownloaded">
          Download progress {{ downloadProgress }}%
        </p>
      </template>
      <div class="c-auto-update__loading" v-if="!updateAvailable">
        Checking for update...
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import AppPageContent from "@/components/AppPageContent.vue";
import BaseButton from "@/components/BaseButton.vue";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import AppModal from "@/components/AppModal.vue";

export const UPDATE_COMPLETE_EVENT = "updateComplete";

@Component({
  components: {
    BaseButton,
    AppModal,
    PageContent: AppPageContent,
  },
})
export default class AutoUpdate extends Vue {
  private showAutoUpdate = true;
  private updateAvailable = false;
  private downloadProgress = 0;
  private updateDownloaded = false;

  created() {
    ipcRenderer.on(IPCEvents.UPDATE_AVAILABLE, () => {
      this.updateAvailable = true;

      if (this.updateDownloaded) {
        ipcRenderer.send(IPCEvents.UPDATE_APP);
      } else {
        ipcRenderer.on(IPCEvents.UPDATE_DOWNLOADED, () => {
          ipcRenderer.send(IPCEvents.UPDATE_APP);
        });
      }
    });

    ipcRenderer.on(IPCEvents.UPDATE_NOT_AVAILABLE, () => {
      this.showAutoUpdate = false;
      this.$emit(UPDATE_COMPLETE_EVENT);
    });

    ipcRenderer.on(
      IPCEvents.DOWNLOAD_PROGRESS,
      (_event: IpcRendererEvent, progress: number) => {
        this.downloadProgress = progress;
      }
    );

    ipcRenderer.on(IPCEvents.UPDATE_DOWNLOADED, () => {
      this.updateDownloaded = true;
    });

    ipcRenderer.send(IPCEvents.CHECK_FOR_UPDATE);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-auto-update__loading {
  margin: $size-spacing--x-large * 2;
}
</style>

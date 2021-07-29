<template>
  <Modal :show-modal="showAutoUpdate" name="autoUpdate">
    <div class="l-column l-center">
      <template v-if="updateAvailable">
        <p>
          There is a new version of the launcher available.
        </p>
        <p>
          The application will restart and automatically apply the update before
          continuing.
        </p>

        <p v-if="updateClicked && !updateDownloaded">
          Download progress {{ downloadProgress }}%
        </p>

        <div class="c-modal__actions" v-if="!updateClicked">
          <Button size="large" @click="close">Close launcher</Button>

          <Button size="large" type="primary" @click="closeAndUpdate">
            Close and update
          </Button>
        </div>
      </template>
      <div class="c-auto-update__loading" v-if="!updateAvailable">
        Checking for update...
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import PageContent from "@/components/PageContent.vue";
import Button from "@/components/controls/Button.vue";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import Modal from "@/components/Modal.vue";

export const UPDATE_COMPLETE_EVENT = "updateComplete";

@Component({
  components: {
    Button,
    Modal,
    PageContent
  }
})
export default class AutoUpdate extends Vue {
  private showAutoUpdate = true;
  private updateAvailable = false;
  private downloadProgress = 0;
  private updateDownloaded = false;
  private updateClicked = false;

  created() {
    ipcRenderer.on(IPCEvents.UPDATE_AVAILABLE, () => {
      this.updateAvailable = true;
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

  closeAndUpdate() {
    this.updateClicked = true;
    if (this.updateDownloaded) {
      ipcRenderer.send(IPCEvents.UPDATE_APP);
    } else {
      ipcRenderer.on(IPCEvents.UPDATE_DOWNLOADED, () => {
        ipcRenderer.send(IPCEvents.UPDATE_APP);
      });
    }
  }

  close() {
    ipcRenderer.send(IPCEvents.CLOSE);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-auto-update__loading {
  margin: $size-spacing--x-large * 2;
}
</style>

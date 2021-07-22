<template>
  <Modal :show-modal="showAutoUpdate" name="autoUpdate">
    <div class="l-column l-center">
      <template v-if="updateAvailable">
        <p>
          There is a new version of the launcher available. The application will
          restart and automatically apply the update before continuing.
        </p>

        <div class="c-modal__actions">
          <Button size="large" @click="close">Close launcher</Button>

          <Button size="large" type="primary" @click="closeAndUpdate">
            Close and update
          </Button>
        </div>
      </template>
      <template v-if="!updateAvailable">Checking for update...</template>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import PageContent from "@/components/PageContent.vue";
import Button from "@/components/controls/Button.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import Modal from "@/components/Modal.vue";

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

  created() {
    ipcRenderer.on(IPCEvents.UPDATE_AVAILABLE, () => {
      this.updateAvailable = true;
    });
    ipcRenderer.on(IPCEvents.UPDATE_NOT_AVAILABLE, () => {
      this.showAutoUpdate = false;
    });
    ipcRenderer.send(IPCEvents.CHECK_FOR_UPDATE);
  }

  closeAndUpdate() {
    ipcRenderer.send(IPCEvents.UPDATE_APP);
  }

  close() {
    ipcRenderer.send(IPCEvents.CLOSE);
  }
}
</script>

<template>
  <vue-final-modal
    v-model="showModel"
    classes="l-column l-center"
    content-class="c-modal"
    overlay-class="c-modal__overlay"
    :fit-parent="true"
    :click-to-close="false"
    :esc-to-close="false"
    :prevent-click="true"
  >
    <div class="l-column l-center">
      <template v-if="updateAvailable">
        <p>
          There is a new version of the launcher available. The application will
          restart and automatically apply the update before continuing.
        </p>

        <div class="c-modal__actions">
          <Button size="large" @click="close">Close launcher</Button>

          <Button size="large" type="primary" @click="closeAndUpdate"
            >Close and update
          </Button>
        </div>
      </template>
      <template v-if="!updateAvailable">Checking for update...</template>
    </div>
  </vue-final-modal>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import PageContent from "@/components/PageContent.vue";
import Button from "@/components/controls/Button.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { Prop } from "vue-property-decorator";

@Component({
  components: {
    Button,
    PageContent
  }
})
export default class AutoUpdate extends Vue {
  private showModel = true;
  private updateAvailable = false;
  @Prop({ required: true }) clickEventsEnabled!: (enabled: boolean) => void;

  created() {
    this.clickEventsEnabled(false);
    ipcRenderer.on(IPCEvents.UPDATE_AVAILABLE, () => {
      this.updateAvailable = true;
    });
    ipcRenderer.on(IPCEvents.UPDATE_NOT_AVAILABLE, () => {
      this.showModel = false;
      this.clickEventsEnabled(true);
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

<style lang="scss">
@import "~@/assets/scss";

.c-modal {
  display: flex;
  align-content: center;
  justify-content: center;

  width: $size-window-width/2;

  padding: $size-spacing--large;

  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--dark;
  backdrop-filter: $background-blur;
}

.c-modal__actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.c-modal__overlay {
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--dark;
  backdrop-filter: $background-blur;
}
</style>

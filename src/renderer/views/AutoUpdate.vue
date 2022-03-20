<template>
  <AppModal :show-modal="showModal" name="autoUpdate">
    <div class="l-column l-center">
      <div class="c-auto-update__loading" v-if="checkingForUpdate">
        Checking for update...
      </div>
      <template v-else>
        <p>There is a new version of the launcher available.</p>
        <p>
          The application will download an update and restart automatically
          before continuing.
        </p>

        Download progress {{ downloadProgress }}%
      </template>
    </div>
  </AppModal>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import AppPageContent from "@/renderer/components/AppPageContent.vue";
import BaseButton from "@/renderer/components/BaseButton.vue";
import AppModal from "@/renderer/components/AppModal.vue";
import {
  UPDATE_EVENTS,
  UPDATE_RENDERER_EVENTS,
} from "@/main/controllers/update/update.events";
import { Prop } from "vue-property-decorator";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";

@Component({
  components: {
    BaseButton,
    AppModal,
    PageContent: AppPageContent,
  },
})
export default class AutoUpdate extends Vue {
  @Prop({ default: "/" }) private nextRoute!: string;
  private downloadProgress = 0;
  private checkingForUpdate = true;
  private showModal = true;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);
  private updateService = injectStrict(SERVICE_BINDINGS.UPDATE_SERVICE);

  async created() {
    this.ipcService.on(UPDATE_RENDERER_EVENTS.UPDATE_AVAILABLE, () => {
      this.checkingForUpdate = false;
    });

    this.ipcService.on(UPDATE_RENDERER_EVENTS.UPDATE_NOT_AVAILABLE, () => {
      this.updateComplete();
    });

    this.ipcService.on(UPDATE_RENDERER_EVENTS.DOWNLOAD_PROGRESS, (progress) => {
      this.downloadProgress = progress as number;
    });

    const skipUpdate = await this.ipcService.invoke(
      UPDATE_EVENTS.ENABLE_AUTO_UPDATE
    );
    if (skipUpdate) {
      this.updateComplete();
    }
  }

  updateComplete() {
    this.showModal = false;
    this.updateService.setUpdateStatus(true);
    this.$router.push({ path: this.nextRoute });
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-auto-update__loading {
  margin: $size-spacing--x-large * 2;
}
</style>

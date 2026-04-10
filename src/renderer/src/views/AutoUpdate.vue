<template>
  <AppModal name="autoUpdate">
    <div class="l-column l-center">
      <div
        v-if="checkingForUpdate"
        data-testid="auto-update-loading"
        class="c-auto-update__loading"
      >
        Checking for update...
      </div>
      <template v-else>
        <div data-testid="auto-update-content">
          <p class="u-text">
            There is a new version of the launcher available.
          </p>
          <p class="u-text">
            The application will download an update and restart automatically
            before continuing.
          </p>
          <p data-testid="auto-update-progress">
            Download progress {{ downloadProgress }}%
          </p>
        </div>
      </template>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppModal from "../components/AppModal.vue";
import { UPDATE_EVENTS } from "@/main/controllers/update/update.events";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const downloadProgress = ref<number | string>(0);
const checkingForUpdate = ref(true);

onMounted(() => {
  ipcService.on(UPDATE_EVENTS.UPDATE_AVAILABLE, () => {
    checkingForUpdate.value = false;
  });

  ipcService.on(UPDATE_EVENTS.DOWNLOAD_PROGRESS, (progress) => {
    checkingForUpdate.value = false;
    downloadProgress.value =
      typeof progress === "number" ? progress : "Unknown";
  });
});
</script>

<style scoped lang="scss">
@use "../assets/scss/index" as *;

.c-auto-update__loading {
  margin: $size-spacing--x-large * 2;
}
</style>

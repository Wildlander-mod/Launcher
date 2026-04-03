<template>
  <AppModal :show-modal="mo2Running" name="mo2Running">
    <div class="l-column l-center">
      <div class="u-spacing l-center-text">
        <p class="u-text">Mod Organizer 2 is currently running.</p>
        <p class="u-text">
          To prevent conflicts, the launcher has been locked until Mod Organizer
          is closed.
        </p>
      </div>
      <BaseButton
        type="warning"
        size="large"
        data-testid="kill-mo2-processes"
        @click="closeMO2"
        >Kill all MO2 Processes
      </BaseButton>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppModal from "./AppModal.vue";
import BaseButton from "./BaseButton.vue";
import { MOD_ORGANIZER_EVENTS } from "@/main/controllers/modOrganizer/modOrganizer.events";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const mo2Running = ref(false);

onMounted(async () => {
  await checkIfRunning();
  watchMO2Running();
});

function watchMO2Running() {
  setTimeout(async () => {
    await checkIfRunning();
    watchMO2Running();
  }, 1000);
}

async function checkIfRunning() {
  mo2Running.value = await ipcService.invoke(
    MOD_ORGANIZER_EVENTS.IS_MO2_RUNNING
  );
}

async function closeMO2() {
  await ipcService.invoke(MOD_ORGANIZER_EVENTS.CLOSE_MO2);
}
</script>

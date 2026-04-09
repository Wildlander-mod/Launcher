<template>
  <AppModal v-if="modpackMetadata" name="modDirectory">
    <BaseImage
      :image-source="defaultLogo"
      :alt="modpackMetadata.name"
      class="c-startup__logo"
    />
    <ModDirectory
      :label="`To get started, select your ${modpackMetadata.name} installation directory:`"
    />
    <span class="c-startup__directory-note">
      Note: you should not install modpacks to any of
      <BaseLink
        href="https://github.com/Wildlander-mod/Launcher/wiki/Directories-you-should-avoid-installing-a-modpack-in"
        :underline="true"
      >
        these directories</BaseLink
      >.
    </span>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppModal from "../components/AppModal.vue";
import BaseImage from "../components/BaseImage.vue";
import BaseLink from "../components/BaseLink.vue";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import type { Modpack } from "@/shared/types/modpack-metadata";
import { MODPACK_EVENTS } from "@/main/controllers/modpack/mopack.events";
import ModDirectory from "../components/ModDirectory.vue";

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const modpackMetadata = ref<Modpack | null>(null);
const defaultLogo = "/images/logos/wildlander-full-light.svg";

onMounted(async () => {
  modpackMetadata.value = await ipcService.invoke(
    MODPACK_EVENTS.GET_MODPACK_METADATA
  );
});
</script>

<style scoped lang="scss">
@import "../assets/scss/index";

.c-startup__logo {
  margin-bottom: $size-spacing--x-large;
}

.c-startup__directory-note {
  font-style: italic;
  font-size: $font-size;
  margin-top: $size-spacing;
}
</style>

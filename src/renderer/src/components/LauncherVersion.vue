<template>
  <template v-if="version && version.includes('-')">
    <Popper :arrow="true" :interactive="false" placement="right" :hover="true">
      <template #content>
        Warning: you are using a beta version of the application. This will not
        automatically update. Click to be taken to the download page for the
        latest version.
      </template>
      <BaseLink
        href="https://github.com/Wildlander-mod/Launcher/releases/tag/v2.6.2"
      >
        <p class="u-text" data-testid="launcher-version">
          Launcher Version: {{ version }}
          <span class="material-icons c-launcher-version__warning">
            warning
          </span>
        </p>
      </BaseLink>
    </Popper>
  </template>

  <template v-else>
    <p class="u-text" data-testid="launcher-version">
      Launcher Version: {{ version }}
    </p>
  </template>
</template>

<script setup lang="ts">
import Popper from "vue3-popper";
import BaseLink from "./BaseLink.vue";

withDefaults(defineProps<{ version?: string | null }>(), { version: null });
</script>

<style scoped lang="scss">
.c-launcher-version__warning {
  color: yellow;
}
</style>

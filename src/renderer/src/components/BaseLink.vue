<template>
  <a
    class="c-link"
    :class="{
      'c-link--underline': underline,
      'c-link--underline-hover': hoverStyle,
    }"
    :href="href"
    @click="openLink"
  >
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
import { SYSTEM_EVENTS } from "@/main/controllers/system/system.events";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";

interface Props {
  href: string;
  underline?: boolean;
  hoverStyle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hoverStyle: false,
});

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

// By default, electron will try to open links in the same window.
// Links need to be opened in the users default browsers instead
function openLink(event: Event): void {
  event.preventDefault();
  ipcService.invoke(SYSTEM_EVENTS.OPEN_LINK_IN_BROWSER, props.href);
}
</script>

<style lang="scss" scoped>
@import "@/renderer/src/assets/scss/index";

.c-link {
  color: $colour-text;
  text-decoration: none;
}

.c-link--underline,
.c-link--underline-hover:hover {
  text-decoration: underline;
}
</style>

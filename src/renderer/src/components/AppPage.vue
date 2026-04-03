<template>
  <main
    class="l-column"
    data-testid="app-page"
    :class="{
      'u-disable-click-events': !clickEventsEnabled,
    }"
  >
    <div class="l-row">
      <TheNavigation v-if="!preloadRoute" />
      <div class="l-column">
        <div class="c-app__page l-column">
          <TheHeader class="l-no-flex-grow" />
          <div class="c-page l-row">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </main>

  <MO2Modal />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import TheHeader from "./TheHeader.vue";
import TheNavigation from "./TheNavigation.vue";
import { modalOpenedEvent } from "../services/modal.service";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "../services/event.service";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import { useRoute } from "vue-router";
import MO2Modal from "./MO2RunningModal.vue";

withDefaults(
  defineProps<{
    layout?: "row" | "column";
  }>(),
  { layout: "column" }
);

const clickEventsEnabled = ref(true);
const preloadRoute = ref(true);

const eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
const route = useRoute();

watch(
  () => route.name,
  () => {
    preloadRoute.value = route.meta?.["preload"] === true;
  }
);

eventService.on(modalOpenedEvent, (opened: unknown) => {
  setClickEventsEnabled(!opened);
});

eventService.on(ENABLE_LOADING_EVENT, () => {
  setClickEventsEnabled(false);
  setLoading(true);
});

eventService.on(DISABLE_LOADING_EVENT, () => {
  setClickEventsEnabled(true);
  setLoading(false);
});

function setClickEventsEnabled(enabled: boolean) {
  clickEventsEnabled.value = enabled;
}

function setLoading(loading: boolean) {
  document.body.style.cursor = loading ? "progress" : "default";
}
</script>

<style lang="scss" scoped>
@import "@/renderer/src/assets/scss/index";

.c-app__page {
  margin-top: $size-spacing--titlebar;
}

.c-page {
  margin-top: $size-spacing--titlebar;
  margin-left: $size-spacing--x-large;
  margin-right: $size-spacing--x-large;

  // Awkward height because the layout engine doesn't allow the page to grow naturally
  // Needs replacing when there is a better layout engine
  max-height: 430px;

  z-index: 0;

  font-size: $font-size--body;
  font-weight: $font-weight;
}
</style>

<template>
  <div
    class="c-app"
    :style="[
      backgroundImage && { 'background-image': `url(${backgroundImage})` },
    ]"
  >
    <TheTitleBar />
    <main
      class="l-column"
      :class="{
        'u-disable-click-events': !clickEventsEnabled,
      }"
    >
      <div class="l-row">
        <TheNavigation v-if="!preloadCheck" />
        <div class="l-column">
          <div class="c-app__page l-column">
            <TheHeader class="l-no-flex-grow" />
            <router-view />
          </div>
        </div>
      </div>
      <TheFooter v-if="!preloadCheck" class="l-end-self" />
    </main>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { modalOpenedEvent } from "@/renderer/services/modal.service";
import { Modpack } from "@/modpack-metadata";
import TheHeader from "@/renderer/components/TheHeader.vue";
import TheTitleBar from "@/renderer/components/TheTitleBar.vue";
import TheFooter from "@/renderer/components/TheFooter.vue";
import TheNavigation from "@/renderer/components/TheNavigation.vue";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/renderer/services/event.service";
import { MODPACK_EVENTS } from "@/main/controllers/modpack/mopack.events";
import { useRoute } from "vue-router";
import { watch } from "vue";
import { SYSTEM_EVENTS } from "@/main/controllers/system/system.events";

@Options({
  components: {
    TheFooter,
    TheHeader,
    TheTitleBar,
    TheNavigation,
  },
})
export default class App extends Vue {
  clickEventsEnabled = false;
  private modpack!: Modpack | undefined;
  private preloadCheck = true;
  private backgroundImage = "";

  private eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  async created() {
    const route = useRoute();
    watch(
      () => route.name,
      () => {
        this.preloadCheck = route.meta?.preload as boolean;
      }
    );

    // This will make an error alert popup if an unsupported Windows version is use.
    await this.ipcService.invoke(SYSTEM_EVENTS.CHECK_SUPPORTED_WIN_VERSION);

    this.modpack = await this.ipcService.invoke(
      MODPACK_EVENTS.GET_MODPACK_METADATA
    );
    if (this.modpack?.backgroundImage) {
      this.backgroundImage = this.modpack.backgroundImage;
    } else {
      this.backgroundImage = "images/default-background.png";
    }

    this.eventService.on(modalOpenedEvent, (opened: unknown) => {
      this.setClickEventsEnabled(!opened as boolean);
    });

    this.eventService.on(ENABLE_LOADING_EVENT, () => {
      this.setClickEventsEnabled(false);
      this.setLoading(true);
    });

    this.eventService.on(DISABLE_LOADING_EVENT, () => {
      this.setClickEventsEnabled(true);
      this.setLoading(false);
    });
  }

  setClickEventsEnabled(enabled: boolean) {
    this.clickEventsEnabled = enabled;
  }

  setLoading(loading: boolean) {
    document.body.style.cursor = loading ? "progress" : "default";
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss";

$size-scrollbar: 16px;
$colour-scrollbar-arrows: white;

body {
  margin: 0;
}

p {
  font-weight: $font-weight--small;
  size: $font-size--large;
  margin: 0;
}

.c-app {
  background-repeat: no-repeat;
  background-size: cover;

  color: $colour-text;
  display: flex;
  flex-direction: column;
  height: $size-window-height;
  width: $size-window-width;

  font-size: $font-size;
}

.c-app__page {
  margin-top: $size-spacing--titlebar;
}

// Custom scrollbars

::-webkit-scrollbar {
  width: $size-scrollbar;
  background-color: $colour-background--darker;
}

::-webkit-scrollbar-thumb {
  background-color: $colour-background--dark;
}

/* Buttons */
::-webkit-scrollbar-button:single-button {
  height: $size-scrollbar;
  width: $size-scrollbar;

  display: block;
  background-size: $size-scrollbar;
  background-repeat: no-repeat;
  background-position: center;
}

// Up arrow
::-webkit-scrollbar-button:single-button:vertical:decrement {
  background-image: url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#{$colour-scrollbar-arrows}"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/></svg>');
}

::-webkit-scrollbar-button:vertical:single-button:decrement:hover,
::-webkit-scrollbar-button:vertical:single-button:increment:hover {
  background-color: $colour-background--dark;
}

// Down arrow
::-webkit-scrollbar-button:single-button:vertical:increment {
  background-image: url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#{$colour-scrollbar-arrows}"><path d="M24 24H0V0h24v24z" fill="none"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>');
}
</style>

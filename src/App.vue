<template>
  <div
    class="c-app"
    :style="{ 'background-image': `url(${modpackInfo.backgroundImage})` }"
  >
    <template v-if="renderApp">
      <main
        class="l-column"
        :class="{
          'u-disable-click-events': !clickEventsEnabled,
        }"
      >
        <div class="l-row">
          <TheNavigation />
          <div class="l-column">
            <TheTitleBar />
            <TheHeader class="l-no-flex-grow" />
            <router-view />
          </div>
        </div>
      </main>
      <TheFooter class="l-end-self" />
    </template>
    <TheStartupChecks @startupChecksComplete="startupChecksComplete" />
  </div>
</template>

<script lang="ts">
import TheFooter from "@/components/TheFooter.vue";
import TheNavigation from "@/components/TheNavigation.vue";
import TheTitleBar from "@/components/TheTitleBar.vue";
import { Options, Vue } from "vue-class-component";
import { EventService, registerServices } from "@/services/service-container";
import TheStartupChecks from "@/components/TheStartupChecks.vue";
import { modalOpenedEvent } from "@/services/modal.service";
import TheHeader from "@/components/TheHeader.vue";
import { modpack } from "@/main/config";
import { Modpack } from "@/modpack-metadata";
import { modDirectorySetEvent } from "@/components/ModDirectory.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import { startupTasks } from "./main/modpack";

export const ENABLE_ACTIONS_EVENT = "ENABLE_ACTIONS_EVENT";
export const DISABLE_ACTIONS_EVENT = "DISABLE_ACTIONS_EVENT";
export const ENABLE_LOADING_EVENT = "ENABLE_LOADING_EVENT";
export const DISABLE_LOADING_EVENT = "DISABLE_LOADING_EVENT";

@Options({
  components: {
    TheHeader,
    TheStartupChecks,
    TheFooter,
    TheNavigation,
    TheTitleBar,
  },
})
export default class App extends Vue {
  clickEventsEnabled = false;
  renderApp = false;
  private eventService!: EventService;

  private modpackInfo!: Modpack;

  async created() {
    this.modpackInfo = modpack;

    const { eventService } = registerServices();

    eventService.on(modalOpenedEvent, (opened: unknown) => {
      this.setClickEventsEnabled(!opened as boolean);
    });

    eventService.on(ENABLE_ACTIONS_EVENT, () => {
      this.setClickEventsEnabled(true);
    });

    eventService.on(DISABLE_ACTIONS_EVENT, () => {
      this.setClickEventsEnabled(false);
    });

    eventService.on(ENABLE_LOADING_EVENT, () => {
      this.setLoading(true);
    });

    eventService.on(DISABLE_LOADING_EVENT, () => {
      this.setLoading(false);
    });

    this.eventService = eventService;
  }

  setClickEventsEnabled(enabled: boolean) {
    this.clickEventsEnabled = enabled;
  }

  setLoading(loading: boolean) {
    document.body.style.cursor = loading ? "progress" : "default";
  }

  async startupChecksComplete() {
    this.renderApp = true;
    this.eventService.on(modDirectorySetEvent, async () => {
      await ipcRenderer.invoke(IPCEvents.RELOAD);
    });
    await startupTasks();
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
  // The url below is a placeholder until we get a system for user generated images
  display: flex;
  flex-direction: column;
  height: $size-window-height;
  width: $size-window-width;

  font-size: $font-size;
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

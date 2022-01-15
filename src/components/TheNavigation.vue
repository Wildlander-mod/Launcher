<template>
  <nav class="c-navigation">
    <div class="c-navigation__actions">
      <BaseButton type="primary" size="grow" @click="launchGame"
        >Launch Game
      </BaseButton>

      <ProfileSelection />

      <ENB />

      <Resolution />
    </div>

    <div class="c-navigation__content l-column l-space-between">
      <div class="l-column">
        <router-link
          :to="{
            name: 'Home',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Home
          </NavigationItem>
        </router-link>

        <router-link
          :to="{
            name: 'Community',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Community
          </NavigationItem>
        </router-link>

        <router-link
          :to="{
            name: 'Advanced',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Advanced
          </NavigationItem>
        </router-link>
      </div>

      <div class="c-navigation__launcher-info">
        <p>Launcher Version: {{ launcherVersion }}</p>
        <BaseLink
          href="https://github.com/Wildlander-mod/Launcher"
          :underline="true"
          >Help contribute
        </BaseLink>
      </div>
    </div>
  </nav>

  <AppModal :show-modal="gameRunning" name="gameRunning">
    <div class="l-column l-center">
      <div class="u-spacing">
        Skyrim is currently launching/running, please wait. This is not an
        error, and the launching process may take several minutes.
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts">
import BaseButton from "./BaseButton.vue";
import BaseDropdown from "./BaseDropdown.vue";
import { version as launcherVersion } from "../../package.json";
import BaseLink from "./BaseLink.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { Options as Component, Vue } from "vue-class-component";
import NavigationItem from "@/components/NavigationItem.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import ProfileSelection from "@/components/ProfileSelection.vue";
import {
  EventService,
  injectStrict,
  SERVICE_BINDINGS,
} from "@/services/service-container";
import Resolution from "@/components/Resolution.vue";
import AppModal from "@/components/AppModal.vue";
import ENB from "@/components/ENB.vue";
import { logger } from "@/main/logger";

@Component({
  components: {
    ENB,
    AppModal,
    Resolution,
    ProfileSelection,
    BaseLink,
    BaseButton,
    BaseDropdown,
    NavigationItem,
  },
})
export default class TheNavigation extends Vue {
  private eventService!: EventService;
  private gameRunning = false;

  launcherVersion = launcherVersion;

  created() {
    this.eventService = injectStrict(SERVICE_BINDINGS.EVENT_SERVICE);
  }

  async launchGame() {
    if (!userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)) {
      await ipcRenderer.invoke(
        IPCEvents.MESSAGE,
        "No mod directory specified, please select one on the settings page."
      );
    } else {
      logger.debug("Setting game to running");
      this.gameRunning = true;
      await ipcRenderer.invoke(IPCEvents.LAUNCH_GAME);
      logger.debug("Setting game to no longer running");
      this.gameRunning = false;
    }
  }

  async closeGame() {
    await ipcRenderer.invoke(IPCEvents.CLOSE_GAME);
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-navigation {
  backdrop-filter: $background-blur--more;
  background: transparentize($colour-background, 0.8);

  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;

  width: 225px;
}

.c-navigation__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 100%;
  padding: 30px;

  border-bottom: 1px solid $colour-background--light;

  // TODO this shouldn't need to be set everywhere
  box-sizing: border-box;

  & * {
    margin-bottom: $size-spacing;
  }

  :last-child {
    margin-bottom: 0;
  }
}

.c-navigation__content {
  width: 100%;
  padding-left: $size-spacing--x-large;
  padding-top: $size-spacing--x-large;
  padding-bottom: $size-spacing--x-large;
  flex: 1;

  // TODO this shouldn't need to be set everywhere
  box-sizing: border-box;
}

.c-navigation__launcher-info {
  font-size: $font-size;
  color: $colour-text--secondary;
}
</style>

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
        <p>Modpack version: {{ modpackVersion }}</p>
        <p>Launcher Version: {{ launcherVersion }}</p>
        <BaseLink
          href="https://github.com/Wildlander-mod/Launcher"
          :underline="true"
          >Help contribute
        </BaseLink>
      </div>
    </div>
  </nav>

  <AppModal :show-modal="!gameRunning" name="gameRunning">
    <div class="l-column l-center">
      <div class="u-spacing">
        Please wait while Skyrim launches. This is not an error, and launching
        may take several minutes.
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts">
import { version as launcherVersion } from "../../../package.json";
import { Options as Component, Vue } from "vue-class-component";
import AppModal from "@/renderer/components/AppModal.vue";
import BaseLink from "@/renderer/components/BaseLink.vue";
import NavigationItem from "@/renderer/components/NavigationItem.vue";
import BaseButton from "@/renderer/components/BaseButton.vue";
import Resolution from "@/renderer/components/Resolution.vue";
import ProfileSelection from "@/renderer/components/ProfileSelection.vue";
import ENB from "@/renderer/components/ENB.vue";
import { MOD_ORGANIZER_EVENTS } from "@/main/controllers/modOrganizer/modOrganizer.events";
import { logger } from "@/main/logger";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { WABBAJACK_EVENTS } from "@/main/controllers/wabbajack/wabbajack.events";

@Component({
  components: {
    ENB,
    AppModal,
    Resolution,
    ProfileSelection,
    BaseLink,
    BaseButton,
    NavigationItem,
  },
})
export default class TheNavigation extends Vue {
  private gameRunning = false;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  launcherVersion = launcherVersion;
  modpackVersion: string | null = null;

  async created() {
    this.modpackVersion = await this.ipcService.invoke(
      WABBAJACK_EVENTS.GET_MODPACK_VERSION
    );
  }

  async launchGame() {
    logger.debug("Setting game to running");
    this.gameRunning = true;
    await this.ipcService.invoke(MOD_ORGANIZER_EVENTS.LAUNCH_GAME);
    logger.debug("Setting game to no longer running");
    this.gameRunning = false;
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

  box-sizing: border-box;
}

.c-navigation__launcher-info {
  font-size: $font-size;
  color: $colour-text--secondary;
}
</style>

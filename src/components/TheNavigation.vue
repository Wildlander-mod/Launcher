<template>
  <nav class="c-navigation">
    <div class="c-navigation__actions">
      <BaseButton type="primary" size="large" @click="launchGame"
        >Launch Game
      </BaseButton>

      <ProfileSelection />
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
            name: 'Graphics',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Graphics
          </NavigationItem>
        </router-link>

        <router-link
          :to="{
            name: 'Resources',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Resources
          </NavigationItem>
        </router-link>

        <router-link
          :to="{
            name: 'Settings',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Settings
          </NavigationItem>
        </router-link>
      </div>

      <div class="c-navigation__launcher-info">
        <p>Launcher Version: {{ launcherVersion }}</p>
        <BaseLink
          href="https://github.com/UltimateSkyrim/ultimate-skyrim-launcher"
          :underline="true"
          >Help contribute
        </BaseLink>
      </div>
    </div>
  </nav>
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
  DISABLE_ACTIONS_EVENT,
  DISABLE_LOADING_EVENT,
  ENABLE_ACTIONS_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/App.vue";
import {
  EventService,
  injectStrict,
  SERVICE_BINDINGS,
} from "@/services/service-container";

@Component({
  components: {
    ProfileSelection,
    BaseLink,
    BaseButton,
    BaseDropdown,
    NavigationItem,
  },
})
export default class TheNavigation extends Vue {
  gameVersion = 0;
  launcherVersion = launcherVersion;

  private eventService!: EventService;

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
      this.eventService.emit(DISABLE_ACTIONS_EVENT);
      this.eventService.emit(ENABLE_LOADING_EVENT);

      await ipcRenderer.invoke(IPCEvents.LAUNCH_GAME);

      this.eventService.emit(ENABLE_ACTIONS_EVENT);
      this.eventService.emit(DISABLE_LOADING_EVENT);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-navigation {
  backdrop-filter: $background-blur--more;
  background: transparentize($colour-background, 0.8);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;

  width: 225px;
}

.c-navigation__actions {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  padding: $size-spacing--x-large;

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
  color: $colour-text-secondary;
}
</style>

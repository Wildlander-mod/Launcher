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
          <NavLink :active="isActive" :href="href" @click="navigate">
            Home
          </NavLink>
        </router-link>

        <router-link
          :to="{
            name: 'GameFiles',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavLink :active="isActive" :href="href" @click="navigate">
            Game files
          </NavLink>
        </router-link>

        <router-link
          :to="{
            name: 'Resources',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavLink :active="isActive" :href="href" @click="navigate">
            Resources
          </NavLink>
        </router-link>

        <router-link
          :to="{
            name: 'Settings',
          }"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <NavLink :active="isActive" :href="href" @click="navigate">
            Settings
          </NavLink>
        </router-link>
      </div>

      <div class="c-navigation__launcher-info">
        <p>Launcher Version: {{ launcherVersion }}</p>
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
import NavLink from "@/components/NavLink.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import ProfileSelection from "@/components/ProfileSelection.vue";

@Component({
  components: {
    ProfileSelection,
    BaseLink,
    BaseButton,
    BaseDropdown,
    NavLink,
  },
})
export default class TheNavigation extends Vue {
  activeTab = "home";
  gameVersion = 0;
  launcherVersion = launcherVersion;

  launchGame() {
    if (!userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)) {
      ipcRenderer.invoke(
        IPCEvents.MESSAGE,
        "No mod directory specified, please select one on the settings page."
      );
    } else {
      ipcRenderer.invoke(IPCEvents.LAUNCH_GAME);
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
  height: $size-window-height - 30px;

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

<template>
  <nav class="c-navigation">
    <div class="c-navigation__actions">
      <Button type="primary" size="large">Launch Game</Button>
      <Select
        :default="defaultPreset"
        :on-option-selected="onPresetSelected"
        :options="qualityOptions"
      />
    </div>

    <div class="c-navigation__content l-column l-space-between">
      <div class="l-column">
        <router-link
          :to="{
            name: 'Home'
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
            name: 'Resources'
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
            name: 'Settings'
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
        <p>Game Version: {{ gameVersion }}</p>
        <p>Launcher Version: {{ launcherVersion }}</p>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import Button from "./controls/Button.vue";
import Select from "./controls/Select.vue";
import { version as launcherVersion } from "../../package.json";
import ExternalLink from "./ExternalLink.vue";
import { PRESETS, USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { Options as Component, Vue } from "vue-class-component";
import { SelectOption } from "@/components/controls/Select.vue";
import NavLink from "@/components/NavLink.vue";

@Component({
  components: {
    ExternalLink,
    Button,
    Select,
    NavLink
  }
})
export default class NavBar extends Vue {
  activeTab = "home";
  gameVersion = 0;
  launcherVersion = launcherVersion;
  qualityOptions = [
    { text: "Low Quality", value: PRESETS.LOW },
    { text: "Medium Quality", value: PRESETS.MEDIUM },
    { text: "High Quality", value: PRESETS.HIGH }
  ];
  defaultPreset!: SelectOption;

  created() {
    this.defaultPreset =
      this.qualityOptions.find(
        preset =>
          preset.value === userPreferences.get(USER_PREFERENCE_KEYS.PRESET)
      ) || this.qualityOptions[0];
  }

  onPresetSelected(option: SelectOption) {
    userPreferences.set(USER_PREFERENCE_KEYS.PRESET, option.value);
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

  :not(:last-child) {
    margin-bottom: 10px;
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

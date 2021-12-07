<template>
  <div>
    <AutoUpdate @updateComplete="updateCompleteHandler" />

    <AppModal :show-modal="showModDirectoryModal" name="modDirectory">
      <BaseImage
        :image-source="modpack.logo"
        :alt="modpack.name"
        class="c-startup__logo"
      />

      <ModDirectory
        @modDirectorySet="modDirectorySet"
        @invalidFilepath="onInvalidModDirectory"
        :hide-open="true"
        :label="`To get started, select your ${modpack.name} installation directory:`"
      />
      <span class="c-startup__directory-note">
        Note: you should not install modpacks to any of
        <BaseLink
          href="https://github.com/Wildlander-mod/Launcher/wiki/Directories-you-should-avoid-installing-a-modpack-in"
          :underline="true"
        >
          these directories</BaseLink
        >.
      </span>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppModal from "@/components/AppModal.vue";
import ModDirectory from "@/components/ModDirectory.vue";
import AutoUpdate from "@/components/AutoUpdate.vue";
import BaseImage from "@/components/BaseImage.vue";
import BaseLink from "@/components/BaseLink.vue";
import {
  Modpack,
  modpack,
  USER_PREFERENCE_KEYS,
  userPreferences,
} from "@/main/config";

@Options({
  components: {
    BaseLink,
    BaseImage,
    AppModal,
    ModDirectory,
    AutoUpdate,
  },
})
export default class TheStartupChecks extends Vue {
  private showModDirectoryModal = true;

  updateComplete = false;
  modDirectorySelected = false;

  private modpack!: Modpack;

  created() {
    this.modpack = modpack;

    this.showModDirectoryModal = !userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );
  }

  updateCompleteHandler() {
    this.updateComplete = true;
    this.checkIfShouldRenderWindow();
  }

  modDirectorySet() {
    this.modDirectorySelected = true;
    this.showModDirectoryModal = false;

    this.checkIfShouldRenderWindow();
  }

  onInvalidModDirectory() {
    this.showModDirectoryModal = true;
  }

  checkIfShouldRenderWindow() {
    if (this.updateComplete && this.modDirectorySelected) {
      this.$emit("startupChecksComplete");
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-startup__logo {
  margin-bottom: $size-spacing--x-large;
}

.c-startup__directory-note {
  font-style: italic;
  font-size: $font-size;
  margin-top: $size-spacing;
}
</style>

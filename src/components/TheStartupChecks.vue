<template>
  <div>
    <AutoUpdate @updateComplete="updateCompleteHandler" />

    <AppModal :show-modal="showModDirectoryModal" name="modDirectory">
      <ModDirectory
        @modDirectorySet="modDirectorySet"
        @invalidFilepath="onInvalidModDirectory"
        :centered="true"
      />
    </AppModal>

    <AppModal :show-modal="showSkyrimDirectoryModal" name="skyrimDirectory">
      <SkyrimDirectory
        @skyrimDirectorySet="skyrimDirectorySet"
        @invalidFilepath="onInvalidSkyrimDirectory"
        :centered="true"
      />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppModal from "@/components/AppModal.vue";
import ModDirectory from "@/components/ModDirectory.vue";
import AutoUpdate from "@/components/AutoUpdate.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import SkyrimDirectory from "@/components/SkyrimDirectory.vue";

@Options({
  components: {
    SkyrimDirectory,
    AppModal,
    ModDirectory,
    AutoUpdate,
  },
})
export default class TheStartupChecks extends Vue {
  private showModDirectoryModal = true;
  private showSkyrimDirectoryModal = true;

  updateComplete = false;
  modDirectorySelected = false;
  skyrimDirectorySelected = false;

  created() {
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

  skyrimDirectorySet() {
    this.skyrimDirectorySelected = true;
    this.showSkyrimDirectoryModal = false;

    this.checkIfShouldRenderWindow();
  }

  onInvalidModDirectory() {
    this.showModDirectoryModal = true;
  }

  onInvalidSkyrimDirectory() {
    this.showSkyrimDirectoryModal = true;
  }

  checkIfShouldRenderWindow() {
    if (
      this.updateComplete &&
      this.modDirectorySelected &&
      this.skyrimDirectorySelected
    ) {
      this.$emit("startupChecksComplete");
    }
  }
}
</script>

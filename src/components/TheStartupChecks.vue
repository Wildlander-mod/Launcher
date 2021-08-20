<template>
  <div>
    <AutoUpdate @updateComplete="updateCompleteHandler" />

    <AppModal :show-modal="showModDirectoryModal" name="modDirectory">
      <ModDirectory
        @modDirectorySet="modDirectorySet"
        @invalidFilepath="onInvalidFilepath"
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

@Options({
  components: {
    AppModal,
    ModDirectory,
    AutoUpdate,
  },
})
export default class TheStartupChecks extends Vue {
  private showModDirectoryModal = true;

  updateComplete = false;
  modDirectorySelected = false;

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

  onInvalidFilepath() {
    this.showModDirectoryModal = true;
  }

  checkIfShouldRenderWindow() {
    if (this.updateComplete && this.modDirectorySelected) {
      this.$emit("startupChecksComplete");
    }
  }
}
</script>

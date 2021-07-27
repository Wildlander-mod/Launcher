<template>
  <div>
    <AutoUpdate @updateComplete="updateCompleteHandler" />

    <Modal :show-modal="showModDirectoryModal" name="modDirectory">
      <ModDirectory
        @filepathSet="filepathSet"
        @invalidFilepath="onInvalidFilepath"
        :centered="true"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Modal from "@/components/Modal.vue";
import ModDirectory from "@/components/ModDirectory.vue";
import AutoUpdate from "@/components/AutoUpdate.vue";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";

@Options({
  components: {
    Modal,
    ModDirectory,
    AutoUpdate
  }
})
export default class StartupChecks extends Vue {
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

  filepathSet() {
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

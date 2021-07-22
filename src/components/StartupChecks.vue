<template>
  <div>
    <AutoUpdate />

    <Modal :show-modal="showModDirectoryModal" name="modDirectory">
      <ModDirectory @filepathSet="showModDirectoryModal = false" />
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

  created() {
    this.showModDirectoryModal = !userPreferences.get(
      USER_PREFERENCE_KEYS.MOD_DIRECTORY
    );
  }
}
</script>

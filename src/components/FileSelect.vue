<template>
  <div>
    <Input
      :label="label"
      :oninput="onFilePathChange"
      :value="filePath"
      :readonly="true"
    />
    <div class="l-row c-file-input__actions">
      <Button
        type="primary"
        @click="openFileSelectDialog"
        class="c-file-input__browse"
      >
        Browse
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import Button from "@/components/controls/Button.vue";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import Input from "@/components/Input.vue";
import { Prop } from "vue-property-decorator";

@Component({
  components: { Button, Input }
})
export default class FileSelect extends Vue {
  @Prop() onFilePathChange!: (filepath: string) => void;
  @Prop() clearFilePathProp!: () => void;
  @Prop({ required: true }) private label!: string;
  @Prop() private initialFilePath!: string;

  private filePath = "";

  created() {
    this.filePath = this.initialFilePath;
  }

  async openFileSelectDialog() {
    const dialogResponse = (await ipcRenderer.invoke(
      IPCEvents.SHOW_OPEN_DIALOG
    )) as Electron.OpenDialogReturnValue;
    if (!dialogResponse.canceled) {
      // Only one directory is allowed to be selected so use the first filePath
      this.filePath = dialogResponse.filePaths[0];
      this.onFilePathChange(this.filePath);
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-file-input__actions {
  margin-top: $size-spacing;
}

.c-file-input__browse {
  margin-right: $size-spacing;
}
</style>

<template>
  <div>
    <Input
      :label="label"
      :oninput="onFilepathChange"
      :value="filepath"
      :readonly="true"
      :centered="centered"
    />
    <div
      class="l-row c-file-input__actions"
      :class="{ 'c-file-input__actions--centered': centered }"
    >
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
import { Prop, Watch } from "vue-property-decorator";

@Component({
  components: { Button, Input }
})
export default class FileSelect extends Vue {
  @Prop() onFilepathChange!: (filepath: string) => void;
  @Prop() clearFilepathProp!: () => void;
  @Prop({ required: true }) private label!: string;
  @Prop() private preFilepathChange!: (filepath: string) => Promise<boolean>;
  @Prop() initialFilepath!: string;
  @Prop() private centered = false;

  private filepath = "";

  created() {
    this.filepath = this.initialFilepath;
  }

  async openFileSelectDialog() {
    const dialogResponse = (await ipcRenderer.invoke(
      IPCEvents.SHOW_OPEN_DIALOG
    )) as Electron.OpenDialogReturnValue;
    if (!dialogResponse.canceled) {
      // Only one directory is allowed to be selected so use the first filepath
      const newFilepath = dialogResponse.filePaths[0];

      // Allow parents to prevent the new filepath from being set
      if (
        this.preFilepathChange &&
        (await this.preFilepathChange(newFilepath))
      ) {
        this.setNewFilepath(newFilepath);
      }
    }
  }

  @Watch("initialFilepath")
  private setNewFilepath(filepath: string) {
    this.filepath = filepath;
    this.onFilepathChange(filepath);
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-file-input__actions {
  margin-top: $size-spacing;
}

.c-file-input__actions--centered {
  justify-content: center;
}

.c-file-input__browse {
  margin-right: $size-spacing;
}
</style>

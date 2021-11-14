<template>
  <div>
    <BaseInput
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
      <BaseButton
        type="primary"
        @click="openFileSelectDialog"
        class="c-file-input__browse"
      >
        Browse
      </BaseButton>
      <BaseButton
        type="default"
        @click="openDirectory"
        class="c-file-input__browse"
        v-if="!hideOpen"
      >
        Open
      </BaseButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import BaseButton from "@/components/BaseButton.vue";
import { ipcRenderer, shell } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import BaseInput from "@/components/BaseInput.vue";
import { Prop, Watch } from "vue-property-decorator";

@Component({
  components: { BaseButton, BaseInput },
})
export default class AppFileSelect extends Vue {
  @Prop({ required: true }) private label!: string;
  @Prop() onFilepathChange!: (filepath: string) => void;
  @Prop() private preFilepathChange!: (filepath: string) => Promise<boolean>;
  @Prop({ default: false }) private centered!: boolean;
  @Prop() private initialFilepath!: string;
  @Prop() private hideOpen!: boolean;
  @Prop() private fileSelectTitle!: string;
  @Prop() private fileSelectButton!: string;
  private filepath!: string;

  created() {
    this.filepath = this.initialFilepath;
  }

  async openFileSelectDialog() {
    const dialogResponse = (await ipcRenderer.invoke(
      IPCEvents.SHOW_OPEN_DIALOG,
      { title: this.fileSelectTitle, button: this.fileSelectButton }
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

  async openDirectory() {
    await shell.openPath(this.filepath);
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

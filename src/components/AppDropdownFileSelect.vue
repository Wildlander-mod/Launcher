<template>
  <BaseDropdown
    :current-selection="currentSelection ?? this.options[0]"
    :options="options"
    @selected="optionSelected"
    grow="true"
    v-if="options"
  />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseDropdown, { SelectOption } from "@/components/BaseDropdown.vue";
import { Prop } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import { IPCEvents } from "@/enums/IPCEvents";
import BaseLabel from "@/components/BaseLabel.vue";

const selectAnotherFile = "SELECT_ANOTHER_FILE";
export const optionSelectedEvent = "file-selected";

@Options({
  components: { BaseLabel, BaseDropdown },
})
export default class AppDropdownFileSelect extends Vue {
  @Prop({ required: true }) private options!: SelectOption[];
  @Prop({ required: true }) private defaultText!: string;
  @Prop() private currentSelection!: SelectOption | null;
  @Prop() private label!: string;

  created() {
    this.options.push({
      text:
        this.options.length === 0
          ? "Select folder..."
          : "Choose another folder...",
      value: selectAnotherFile,
    });

    // Add the default option if none is selected
    if (!this.currentSelection) {
      this.options.unshift({
        text: this.defaultText,
        value: null,
        disabled: true,
        hidden: true,
      });
    }
  }

  async optionSelected(selectedOption: unknown) {
    if (selectedOption === selectAnotherFile) {
      const dialogResponse = (await ipcRenderer.invoke(
        IPCEvents.SHOW_OPEN_DIALOG
      )) as Electron.OpenDialogReturnValue;
      if (dialogResponse.canceled) {
        // If the dialog was cancelled, do nothing
        return;
      } else {
        // Only one directory is allowed to be selected so use the first filepath
        this.$emit(optionSelectedEvent, dialogResponse.filePaths[0]);
      }
    } else {
      this.$emit(optionSelectedEvent, selectedOption);
    }
  }
}
</script>

<style scoped lang="scss"></style>

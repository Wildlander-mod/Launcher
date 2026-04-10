<template>
  <BaseDropdown
    v-if="options"
    :current-selection="currentSelection ?? options[0]"
    :options="options"
    grow="true"
    :small="true"
    @selected="optionSelected"
  />
</template>

<script lang="ts">
export const optionSelectedEvent = "file-selected";
</script>

<script setup lang="ts">
import { ref } from "vue";
import BaseDropdown, { type SelectOption } from "./BaseDropdown.vue";
import { DIALOG_EVENTS } from "../../../main/controllers/dialog/dialog.events";
import type { OpenDialogReturnValue } from "electron";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";

const selectAnotherFile = "SELECT_ANOTHER_FILE";

const props = defineProps<{
  options: SelectOption[];
  defaultText: string;
  currentSelection?: SelectOption | null;
  label?: string;
}>();

const emit = defineEmits<{
  "file-selected": [value: unknown];
}>();

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

// Build local copy so we don't mutate the prop
const options = ref<SelectOption[]>([...props.options]);

const selectText =
  options.value.length === 0 ? "Select folder..." : "Choose another folder...";

if (props.currentSelection === null) {
  // Explicit null (no selection made yet): show placeholder as first/current item
  options.value.unshift({
    text: props.defaultText,
    value: null,
    disabled: true,
    hidden: true,
  });
  options.value.push({ text: selectText, value: selectAnotherFile });
} else if (props.currentSelection === undefined) {
  // Not provided: append placeholder then SELECT_ANOTHER so real options stay at front
  options.value.push({
    text: props.defaultText,
    value: null,
    disabled: true,
    hidden: true,
  });
  options.value.push({ text: selectText, value: selectAnotherFile });
} else {
  options.value.push({ text: selectText, value: selectAnotherFile });
}

async function optionSelected({ value }: SelectOption) {
  if (value === selectAnotherFile) {
    const dialogResponse = await ipcService.invoke<OpenDialogReturnValue>(
      DIALOG_EVENTS.DIRECTORY_SELECT
    );
    if (!dialogResponse.canceled) {
      // Only one directory is allowed to be selected so use the first filepath
      emit(optionSelectedEvent, dialogResponse.filePaths[0]);
    }
  } else {
    emit(optionSelectedEvent, value);
  }
}
</script>

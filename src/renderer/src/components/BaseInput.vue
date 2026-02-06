<template>
  <div class="l-column">
    <BaseLabel :label="label" :centered="centered" />
    <input
      data-testid="base-input"
      type="text"
      :readonly="readonly"
      class="c-input"
      :value="value"
      @input="handleInput"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import BaseLabel from "./BaseLabel.vue";

interface Props {
  label: string;
  readonly?: boolean;
  centered?: boolean;
  value?: string;
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  centered: false,
  value: "",
});

const emit = defineEmits<{
  (e: "input", target: HTMLInputElement): void;
  (e: "click", target: HTMLInputElement): void;
}>();

function handleInput(event: Event): void {
  emit("input", event.target as HTMLInputElement);
}

function handleClick(event: Event): void {
  emit("click", event.target as HTMLInputElement);
}
</script>

<style scoped lang="scss">
@import "@/renderer/src/assets/scss/index";

.c-input {
  height: $size-action-height;
  padding: $size-spacing;

  margin-right: $size-spacing;

  box-sizing: border-box;
  color: #ffffff;
  background: $colour-background--light;
  border: none;
  border-radius: 2px;
}
</style>

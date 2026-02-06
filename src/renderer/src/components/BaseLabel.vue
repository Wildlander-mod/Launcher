<template>
  <label
    class="c-label"
    :class="{ 'c-label--centered': centered }"
    data-testid="input-label"
  >
    {{ label }}
  </label>
</template>

<script setup lang="ts">
defineProps<{
  centered?: boolean;
  label: string;
}>();
</script>

<style scoped lang="scss">
@import "@/renderer/src/assets/scss/index";

.c-label {
  font-size: $font-size--body;
  line-height: $line-height__body;

  margin-bottom: $size-spacing;
}

.c-label--centered {
  display: flex;
  justify-content: center;
  text-align: center;
}
</style>

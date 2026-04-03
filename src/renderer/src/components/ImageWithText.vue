<template>
  <div class="l-column l-center">
    <BaseImage
      :image-source="imageSource"
      :alt="alt"
      :height="50"
      :width="50"
    />
    <div class="c-svg-with-text__text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import BaseImage from "./BaseImage.vue";

defineProps<{
  imageSource: string;
  alt: string;
  text: string;
}>();
</script>

<style scoped lang="scss">
@import "@/renderer/src/assets/scss/index";

.c-svg-with-text__text {
  margin-top: $size-spacing;
}
</style>

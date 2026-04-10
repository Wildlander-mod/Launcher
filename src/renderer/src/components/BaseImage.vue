<template>
  <img :src="imageSource" :alt="alt" :height="height" :width="width" />
</template>

<script setup lang="ts">
defineProps<{
  imageSource: string;
  alt: string;
  height?: number;
  width?: number;
}>();
</script>

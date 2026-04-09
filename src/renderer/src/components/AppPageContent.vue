<template>
  <div class="c-page-content l-column">
    <div
      data-testid="page-content-body"
      class="c-page-content__body"
      :class="{
        'c-page-content__body--large-spacing': spacing,
        'u-scroll-y-auto': scrollable,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    spacing?: boolean;
    center?: boolean;
    scrollable?: boolean;
  }>(),
  {
    spacing: true,
    center: false,
    scrollable: false,
  }
);
</script>

<style lang="scss" scoped>
@import "../assets/scss/index";

.c-page-content {
  &:not(:last-of-type) {
    margin-right: $size-spacing;
  }
}

.c-page-content__title {
  font-size: $font-size--x-large;
  font-weight: $font-weight--x-large;
  margin-top: 10px;
  margin-bottom: 10px;
}

.c-page-content__body {
  display: flex;

  backdrop-filter: $background-blur;
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--dark;
}

.c-page-content__body--large-spacing {
  padding: $size-spacing--x-large;
}
</style>

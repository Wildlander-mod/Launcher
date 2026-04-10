<template>
  <a
    class="c-nav-link"
    :class="{ 'c-nav-link--active': active }"
    data-testid="navigation-item"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();
</script>

<style scoped lang="scss">
@use "../assets/scss/index" as *;

.c-nav-link {
  text-decoration: none;
  color: $colour-text--secondary;
  margin-bottom: $size-spacing--x-large;
  font-size: $font-size-subtitle-alt;

  &.c-nav-link--active,
  &:hover {
    color: $colour-text;

    border-right: 6px solid $colour-primary;
  }
}
</style>

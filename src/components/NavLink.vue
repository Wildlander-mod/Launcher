<template>
  <a class="c-nav-link" :class="{ 'c-nav-link--active': active }">
    <slot />
  </a>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class NavLink extends Vue {
  @Prop() private active!: boolean;
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-nav-link {
  text-decoration: none;
  color: $colour-text-secondary;
  margin-bottom: $size-spacing--x-large;
  font-size: $font-size-subtitle-alt;

  padding-top: $size-spacing;
  padding-bottom: $size-spacing;

  &.c-nav-link--active {
    color: $colour-text;

    border-right: 6px solid $colour-primary;
  }
}
</style>

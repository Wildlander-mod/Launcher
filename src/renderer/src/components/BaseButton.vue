<template>
  <div
    :class="[
      'c-button u-text',
      `c-button--${size}`,
      `c-button--${type}`,
      { 'c-button--disabled': disabled },
    ]"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export type ButtonSizes = "large" | "small" | "grow";
export type ButtonTypes = "primary" | "default" | "warning";

@Component({})
export default class BaseButton extends Vue {
  @Prop({ default: "small" }) size!: ButtonSizes;
  @Prop({ default: "default" }) type!: ButtonTypes;
  @Prop({ default: false }) disabled!: boolean;
}
</script>

<style lang="scss" scoped>
@import "~@/renderer/src/assets/scss";

.c-button {
  background-color: $colour-background--dark;
  border: 0;
  border-radius: 2px;
  color: $colour-text;
  display: flex;
  min-height: $size-action-height;
  justify-content: center;
  align-items: center;
  padding: 0;
  user-select: none;

  &:active:not(.c-button--disabled),
  &:hover:not(.c-button--disabled) {
    background-color: lighten($colour-background--dark, 10%);
  }

  &:hover:not(.c-button--disabled) {
    cursor: pointer;
  }

  &--disabled {
    cursor: progress;
  }

  &--large {
    width: 155px;
  }

  &--grow {
    flex: 1;
  }

  &--primary {
    background-color: $colour-primary;

    &:active:not(.c-button--disabled),
    &:hover:not(.c-button--disabled) {
      background-color: $colour-primary--light;
    }
  }

  &--warning {
    background-color: $color-warning;

    &active:not(.c-button--disabled),
    &:hover:not(.c-button--disabled) {
      background-color: $color-warning--light;
    }
  }

  &--small {
    min-width: 85px;
  }
}
</style>

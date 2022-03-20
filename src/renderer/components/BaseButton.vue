<template>
  <div
    :class="[
      'c-button',
      { [`c-button--${size}`]: size !== 'grow' },
      `c-button--${type}`,
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
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-button {
  background-color: $colour-background--dark;
  border: 0;
  border-radius: 2px;
  color: $colour-text;
  display: flex;
  height: $size-action-height;
  justify-content: center;
  padding: 0;
  user-select: none;

  // These shouldn't have to be set specifically here
  // but they were originally only set on the <p> tag
  font-weight: 300;
  line-height: 30px;
  size: 14px;

  &:active,
  &:hover {
    background-color: lighten($colour-background--dark, 10%);
  }

  &:hover {
    cursor: pointer;
  }

  &--large {
    width: 155px;
  }

  &--primary {
    background-color: $colour-primary;

    &:active,
    &:hover {
      background-color: $colour-primary--light;
    }
  }

  &--warning {
    background-color: $color-warning;

    &active,
    &:hover {
      background-color: $color-warning--light;
    }
  }

  &--small {
    width: 85px;
  }
}
</style>

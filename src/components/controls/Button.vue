<template>
  <div :class="[size, type].join(' ')">
    <p>
      {{ text }}
    </p>
  </div>
</template>

<script>
export default {
  name: "Button",
  props: {
    size: {
      type: String,
      default: "small"
    },
    text: String,
    type: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

div {
  background-color: $colour-background--dark;
  border: 0;
  border-radius: 2px;
  color: $colour-text;
  display: flex;
  height: 30px;
  justify-content: center;
  padding: 0;
  user-select: none;

  &:active,
  &:hover {
    background-color: lighten($colour-background--dark, 10%);
  }

  &:hover {
    cursor: pointer;
  }

  &.large {
    width: 155px;
  }

  &.primary {
    background-color: $colour-primary;

    &:active,
    &:hover {
      background-color: $colour-primary--light;
    }
  }

  &.small {
    width: 85px;
  }
}
</style>

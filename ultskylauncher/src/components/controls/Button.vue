<template>
  <div
    :class="[
      size,
      type
    ].join(' ')"
  >
    <p>
      {{ text }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'Button',
  props: {
    size: {
      type: String,
      default: 'small'
    },
    text: String,
    type: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
div {
  background-color: #e1e1e199;
  border: 0px;
  border-radius: 2px;
  color: #ffffff;
  display: flex;
  height: 30px;
  justify-content: center;
  padding: 0px;
  user-select: none;

  &:hover {
    cursor: pointer;
  }

  &.large {
    width: 155px;
  }

  &.primary {
    background-color: #0b32e6;

    &:active {
      background-color: #3a5eff;
    }
  }

  &.small {
    width: 85px;
  }
}
</style>

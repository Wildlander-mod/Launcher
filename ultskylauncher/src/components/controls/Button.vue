<template>
  <button
    :class="cssClasses"
  >
    {{ text }}
  </button>
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
  },
  computed: {
    cssClasses () {
      return [this.size, this.type].join(' ')
    }
  }
}
</script>

<style lang="scss">
button {
  background-color: #e1e1e199;
  border: 0px;
  border-radius: 2px;
  color: #ffffff;
  font-family: 'Averta-Thin';
  height: 35px;
  line-height: 35px;
  padding: 0px;
  size: 20px;

  &.large {
    width: 155px;
  }

  &.primary {
    background-color: #0b32e6;
  }

  &.small {
    width: 85px;
  }
}
</style>

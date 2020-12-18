<template>
  <footer>
    <p>Thanks to all the Patrons!</p>
    <Marquee
      :text="marqueeText"
    />
  </footer>
</template>

<script>
import Marquee from './Marquee.vue'

export default {
  name: 'Footer',
  components: {
    Marquee
  },
  props: {
    marqueeText: Array
  }
}
</script>

<style lang="scss">
footer {
  background-color: #000000;
  display: flex;
  height: 30px;

  p {
    line-height: 30px;
    margin: 0px;
    padding-left: 8px;
    size: 14px;
    white-space: nowrap;
  }
}
</style>

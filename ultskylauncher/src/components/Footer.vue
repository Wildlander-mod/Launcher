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
  background-color: black;
  color: white;
  display: flex;

  p {
    white-space: nowrap;
  }
}
</style>

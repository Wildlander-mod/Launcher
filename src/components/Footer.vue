<template>
  <footer>
    <p>
      Thanks to all the Patrons!
    </p>
    <Marquee
      :items="marqueeItems"
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
    marqueeItems: Array
  }
}
</script>

<style lang="scss" scoped>
footer {
  background-color: #000000;
  display: flex;
  height: 30px;

  p {
    font-weight: 600;
    margin-left: 8px;
    white-space: nowrap;
  }
}
</style>

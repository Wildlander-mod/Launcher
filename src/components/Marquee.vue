<template>
  <div id="marquee">
    <div id="marquee__fade--before" />
    <span>
      <p :key="element.key" v-for="element in text">
        {{ element }}
      </p>
    </span>
    <div id="marquee__fade--after" />
  </div>
</template>

<script>
export default {
  name: "Marquee",
  props: {
    text: Array,
  },
};
</script>

<style lang="scss" scoped>
#marquee {
  position: relative;
  width: 100%;

  div {
    background: linear-gradient(90deg, #000000 30%, 70%, #00000000);
    height: 100%;
    position: absolute;
    top: 0;
    width: 10%;
    z-index: 1;

    &#marquee__fade--before {
      left: 0;
    }

    &#marquee__fade--after {
      left: 90%;
      transform: matrix(-1, 0, 0, 1, 0, 0);
    }
  }

  span {
    display: flex;
    position: relative;
    justify-content: space-between;

    p {
      font-size: 10px;
      font-weight: 200;
    }
  }
}
</style>

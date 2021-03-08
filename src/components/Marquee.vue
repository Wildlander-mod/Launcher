<template>
  <div class="marquee marquee--fadeout" :key="items">
    <div
      class="marquee__scroller"
      :style="{ 'animation-duration': `${getAnimationLength()}s` }"
    >
      <p :class="`marquee__item`" :key="element.key" v-for="element in items">
        {{ element }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Marquee",
  props: {
    items: Array,
  },
  methods: {
    getAnimationLength() {
      // The length of the animation should depend on the amount of items in the marquee
      // We can't use the length at lower numbers because it is too fast
      switch (true) {
        case this.$props.items.length < 5:
          return 10;
        case this.$props.items.length < 10:
          return 20;
      }
      return this.$props.items.length * 2;
    },
  },
};
</script>

<style lang="scss" scoped>
.marquee {
  position: relative;
  overflow: hidden;
  width: 100%;

  /* Fade in/out content at the sides of the marquee*/
  &--fadeout {
    &:before,
    &:after {
      content: "";
      width: 5%;
      height: 100%;
      top: 0;
    }

    /* Fade out content on the left side of the marquee */
    &:before {
      background: linear-gradient(
        to right,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0) 100%
      );
      position: absolute;
      left: 0;
      z-index: 1;
    }

    /* Fade in content on the right side of the marquee */
    &:after {
      background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 1) 100%
      );
      position: absolute;
      right: 0;
      z-index: 1;
    }
  }

  .marquee__scroller {
    animation: marquee linear infinite;
    width: max-content;

    .marquee__item {
      font-size: 10px;
      font-weight: 200;

      display: inline-block;
      margin-left: 2em;
    }
  }

  @keyframes marquee {
    0% {
      transform: translate(800px, 0);
    }
    100% {
      transform: translate(-100%, 0);
    }
  }
}
</style>

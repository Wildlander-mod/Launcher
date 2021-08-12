<template>
  <div class="marquee marquee--fadeout">
    <div
      :style="{ 'animation-duration': `${getAnimationLength()}s` }"
      class="marquee__scroller"
    >
      <p v-for="element in items" :key="element.key" :class="`marquee__item`">
        {{ element }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class Marquee extends Vue {
  @Prop() items!: string[];

  getAnimationLength(): number {
    // The length of the animation should depend on the amount of items in the marquee
    // We can't use the length at lower numbers because it is too fast
    switch (true) {
      case this.items.length < 5:
        return 10;
      case this.items.length < 10:
        return 20;
    }
    return this.items.length * 2;
  }
}
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

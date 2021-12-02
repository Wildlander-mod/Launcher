<template>
  <div class="c-page-content">
    <h2 class="c-page-content__title" v-if="title">
      {{ title }}
    </h2>
    <div
      class="c-page-content__body"
      v-bind:class="{
        'c-page-content__body--small-height': height === 'small',
        'c-page-content__body--auto-height': height === 'auto',
        'c-page-content__body--small-width': width === 'small',
        'c-page-content__body--large-spacing': width !== 'small',
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class AppPageContent extends Vue {
  @Prop({ required: false }) title!: string;
  @Prop({ default: "auto" }) height!: "small" | "large" | "auto";
  @Prop({ default: "large" }) width!: "small" | "large";
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-page-content {
  margin-top: 10px;

  &:first-of-type {
    margin-top: 0;
  }

  &:last-of-type {
    margin-bottom: 10px;
  }
}

.c-page-content__title {
  font-size: $font-size--x-large;
  font-weight: $font-weight--x-large;
  margin-top: 10px;
  margin-bottom: 10px;
}

.c-page-content__body {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;

  backdrop-filter: $background-blur;
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--dark;
  height: 200px;
  margin-top: 5px;
}

.c-page-content__body--large-spacing {
  padding: $size-spacing--x-large;
}

.c-page-content__body--auto-height {
  height: auto;
}

.c-page-content__body--small-height {
  height: 120px;
}

.c-page-content__body--small-width {
  width: 350px;
}
</style>

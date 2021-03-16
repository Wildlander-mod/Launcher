<template>
  <div class="c-page-content">
    <h2 class="c-page-content__title">
      {{ title }}
    </h2>
    <div
      class="c-page-content__body"
      v-bind:class="{
        'c-page-content__body--small-height': height === 'small'
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import "reflect-metadata";
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class PageContent extends Vue {
  @Prop({ required: true }) title!: string;
  @Prop({ default: "full" }) height!: "small" | "large";
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/settings";

.c-page-content {
  margin-top: 10px;
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

  backdrop-filter: blur(10px);
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--darker;
  height: 200px;
  margin-top: 5px;
}

.c-page-content__body--small-height {
  height: 120px;
}
</style>

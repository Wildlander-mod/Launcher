<template>
  <div
    class="c-page"
    :class="{ 'l-row': layout === 'row', 'l-column': layout === 'column' }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class AppPage extends Vue {
  @Prop({ default: "column" }) private layout!: "row" | "column";
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-page {
  margin-top: $size-spacing--titlebar;
  margin-left: $size-spacing--x-large;
  margin-right: $size-spacing--x-large;

  // Awkward height because the layout engine doesn't allow the page to grow naturally
  // Needs replacing when there is a better layout engine
  max-height: 408px;

  z-index: 0;

  font-size: $font-size--body;
  font-weight: $font-weight;
}
</style>

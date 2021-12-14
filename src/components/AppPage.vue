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
  margin: $size-spacing--large $size-spacing--x-large;

  max-height: 400px;

  z-index: 0;

  font-size: $font-size--body;
  font-weight: $font-weight;
}
</style>

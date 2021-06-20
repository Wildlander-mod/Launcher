<template>
  <div class="c-page">
    <slot></slot>
  </div>
</template>

<script>
import { Vue } from "vue-class-component";

export default class Page extends Vue {}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-page {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-right: 30px;

  font-size: $font-size;
  font-weight: $font-weight;
}
</style>

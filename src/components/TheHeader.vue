<template>
  <div>
    <div class="c-header">
      <div class="c-header__title">
        <LogoUltSky fill="#ffffff" :height="30" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import LogoUltSky from "@/components/LogoUltSky.vue";

@Options({
  components: { LogoUltSky },
})
export default class TheHeader extends Vue {}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-header {
  margin-left: $size-spacing--x-large;
  margin-top: $size-spacing--large;
}
</style>

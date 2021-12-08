<template>
  <div>
    <div class="c-header l-center">
      <div class="c-header__title">
        <BaseImage :image-source="modpack.logo" :alt="modpack.name" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseImage from "@/components/BaseImage.vue";
import { Modpack, modpack } from "@/main/config";

@Options({
  components: { BaseImage },
})
export default class TheHeader extends Vue {
  private modpack!: Modpack;

  created() {
    this.modpack = modpack;
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-header {
  margin-left: $size-spacing--x-large;
  margin-top: $size-spacing--large;
}
</style>

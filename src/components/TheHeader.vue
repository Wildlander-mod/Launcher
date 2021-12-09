<template>
  <div class="c-header l-row l-space-between">
    <BaseImage :image-source="modpack.logo" :alt="modpack.name" />

    <div class="l-row l-no-flex-grow">
      <div v-if="modpack.website" class="c-header__link l-center-vertically">
        <BaseLink :href="modpack.patreon" :hover-style="true"
          >Website
        </BaseLink>
      </div>
      <div v-if="modpack.wiki" class="c-header__link l-center-vertically">
        <BaseLink :href="modpack.wiki" :hover-style="true">Wiki</BaseLink>
      </div>
      <div v-if="modpack.wiki" class="c-header__link l-center-vertically">
        <BaseLink :href="modpack.patreon" :hover-style="true"
          >Patreon
        </BaseLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseImage from "@/components/BaseImage.vue";
import { Modpack, modpack } from "@/main/config";
import BaseLink from "@/components/BaseLink.vue";

@Options({
  components: { BaseLink, BaseImage },
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
  // The head links need a bit more space than normal due to their sizing
  margin-left: $size-spacing--x-large;
  margin-right: $size-spacing--x-large;
  margin-top: $size-spacing--large;
}

.c-header__link {
  margin-left: $size-spacing--large + $size-spacing--x-small;
  font-size: $font-size--large;
}
</style>

<template>
  <div class="l-column l-center">
    <BaseImage
      :image-source="imageSource"
      :alt="alt"
      :height="50"
      :width="50"
    />
    <div class="c-svg-with-text__text">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import BaseImage from "./BaseImage.vue";

@Options({
  components: { BaseImage },
})
export default class ImageWithText extends Vue {
  @Prop({ required: true }) imageSource!: string;
  @Prop({ required: true }) alt!: string;
  @Prop({ required: true }) text!: string;
}
</script>

<style scoped lang="scss">
@import "@/renderer/src/assets/scss/index";

.c-svg-with-text__text {
  margin-top: $size-spacing;
}
</style>

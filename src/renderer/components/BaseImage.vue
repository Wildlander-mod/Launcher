<template>
  <img :src="imageSource" :alt="alt" :height="height" :width="width" />
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class BaseImage extends Vue {
  @Prop({ require: true }) imageSource!: string;
  @Prop({ required: true }) alt!: string;
  @Prop() height!: number;
  @Prop() width!: number;
}
</script>

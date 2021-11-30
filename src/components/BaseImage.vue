<template>
  <img :src="imageSource" :alt="alt" height="50" width="50" />
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class BaseImage extends Vue {
  @Prop({ require: true }) imageSource!: string;
  @Prop({ required: true }) alt!: string;
}
</script>

<template>
  <a :href="href" class="c-link" @click="openLink">
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { shell } from "electron";

export default class ExternalLink extends Vue {
  @Prop({ required: true }) href!: string;

  // By default, electron will try to open links in the same window.
  // Links needs to be opened in the users default browsers instead
  openLink(event: Event) {
    event.preventDefault();
    shell.openExternal(this.href);
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-link {
  color: $colour-text;
  text-decoration: none;
}
</style>

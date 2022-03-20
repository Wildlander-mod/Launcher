<template>
  <a
    class="c-link"
    :class="{
      'c-link--underline': underline,
      'c-link--underline-hover': hoverStyle,
    }"
    :href="href"
    @click="openLink"
  >
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { SYSTEM_EVENTS } from "@/main/controllers/system/system.events";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";

export default class BaseLink extends Vue {
  @Prop({ required: true }) href!: string;
  @Prop() underline!: boolean;
  @Prop({ default: false }) hoverStyle!: boolean;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  // By default, electron will try to open links in the same window.
  // Links need to be opened in the users default browsers instead
  openLink(event: Event) {
    event.preventDefault();
    this.ipcService.invoke(SYSTEM_EVENTS.OPEN_LINK_IN_BROWSER, this.href);
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-link {
  color: $colour-text;
  text-decoration: none;
}

.c-link--underline,
.c-link--underline-hover:hover {
  text-decoration: underline;
}
</style>

<template>
  <div class="c-title-bar l-row l-end" :class="{ 'l-no-flex-grow': !grow }">
    <div class="c-title-bar__navigation-bar"></div>
    <div class="c-title-bar__control" @click="minimize">
      <span class="material-icons c-title-bar__control-icon"> remove </span>
    </div>
    <div class="c-title-bar__control" @click="close">
      <span class="material-icons c-title-bar__control-icon"> close </span>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import { Vue } from "vue-class-component";
import { IPCEvents } from "@/enums/IPCEvents";
import { Prop } from "vue-property-decorator";

export default class TheTitleBar extends Vue {
  @Prop({ default: false }) private grow!: boolean;

  close() {
    ipcRenderer.send(IPCEvents.CLOSE);
  }

  minimize() {
    ipcRenderer.send(IPCEvents.MINIMIZE);
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-title-bar {
  height: $size-spacing--titlebar;

  // The modal used sets its background-blur z-index to 1000. The title bar needs to be able to go over the top.
  z-index: 2000;
}

.c-title-bar__control-icon {
  // This needs to match the size of the bar itself
  font-size: $size-spacing--titlebar;
}

.c-title-bar__control {
  -webkit-app-region: no-drag;
  cursor: pointer;

  &:hover {
    background-color: $colour-background--dark;
  }
}

.c-title-bar__navigation-bar {
  // Allow the whole window to be dragged by the navigation bar
  -webkit-app-region: drag;
  -webkit-user-select: none;
  flex-grow: 1;
}
</style>

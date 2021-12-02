<template>
  <div class="c-title-bar l-row l-end l-no-flex">
    <div class="c-title-bar__navigation-bar"></div>
    <div class="c-title-bar__control" @click="minimize">
      <span class="material-icons"> remove </span>
    </div>
    <div class="c-title-bar__control" @click="close">
      <span class="material-icons"> close </span>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import { Vue } from "vue-class-component";
import { IPCEvents } from "@/enums/IPCEvents";

export default class TheTitleBar extends Vue {
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
  height: 24px;
  background-color: $colour-background--darker-solid;
  // The modal used sets its background-blur z-index to 1000. The title bar needs to be able to go over the top.
  z-index: 2000;
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

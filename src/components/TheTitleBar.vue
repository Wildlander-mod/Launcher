<template>
  <div class="c-control-bar l-row l-end">
    <div class="c-navigation-bar"></div>
    <div class="c-control-bar__control" @click="minimize">
      <span class="material-icons"> remove </span>
    </div>
    <div class="c-control-bar__control" @click="close">
      <span class="material-icons"> close </span>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import { Options, Vue } from "vue-class-component";
import LogoUltSky from "@/components/LogoUltSky.vue";

@Options({
  components: {
    LogoUltSky,
  },
})
export default class TheTitleBar extends Vue {
  close() {
    ipcRenderer.send("close");
  }

  minimize() {
    ipcRenderer.send("minimize");
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-navigation-bar {
  // Allow the whole window to be dragged by the navigation bar
  -webkit-app-region: drag;
  -webkit-user-select: none;
  flex-grow: 1;
}

.c-control-bar {
  height: 24px;
  background-color: $colour-background--darker-solid;
}

.c-control-bar__control {
  cursor: pointer;
  -webkit-app-region: no-drag;
}
</style>

<template>
  <div class="c-navigation-bar">
    <div class="c-navigation-bar__controls">
      <span class="material-icons c-navigation-bar__control" @click="minimize">
        remove
      </span>
      <span class="material-icons c-navigation-bar__control" @click="close">
        close
      </span>
    </div>
  </div>
  <div class="c-header">
    <div class="c-header__title">
      <Logo fill="#ffffff" height="30px" />
    </div>
    <p class="c-header__subtext">
      Choose a performance preset and the click "Launch Game" to play!
      <br />
      Use the side navigation to edit or change your ENB and launcher settings.
    </p>
  </div>
</template>

<script lang="ts">
import Logo from "@/components/svgs/Logo.vue";
import { ipcRenderer } from "electron";

export default {
  name: "TitleBar",
  components: {
    Logo
  },
  methods: {
    close() {
      ipcRenderer.send("close");
    },
    minimize() {
      ipcRenderer.send("minimize");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-navigation-bar__controls {
  height: 30px;
  text-align: end;
}

.c-navigation-bar__control {
  cursor: pointer;
}

.c-header {
  margin-left: 30px;
}

.c-header__subtext {
  color: $colour-text;
  font-size: 12px;
  line-height: 15px;
  margin-top: 8px;
  width: 450px;
}
</style>

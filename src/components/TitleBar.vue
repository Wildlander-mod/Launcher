<template>
  <div id="title-bar">
    <div id="title-bar__controls">
      <span class="material-icons" @click="minimize"> remove </span>
      <span class="material-icons" @click="close"> close </span>
    </div>
    <div id="title-bar__title">
      <Logo fill="#ffffff" height="30px" />
      <p>
        Choose a performance preset and the click "Launch Game" to play!
        <br />
        Use the side navigation to edit or change your ENB and launcher
        settings.
      </p>
    </div>
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
@import "~@/assets/scss/settings";

div {
  height: 100px;

  #title-bar__controls {
    height: 30px;
    text-align: end;

    span:hover {
      cursor: pointer;
    }
  }

  #title-bar__title {
    margin-left: 30px;

    p {
      color: $colour-text;
      font-size: 12px;
      line-height: 15px;
      margin-top: 10px;
      width: 450px;
    }
  }
}
</style>

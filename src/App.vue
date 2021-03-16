<template>
  <div id="window">
    <main>
      <NavBar />
      <div id="window__content">
        <TitleBar />
        <router-view />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import Footer from "@/components/Footer.vue";
import NavBar from "@/components/NavBar.vue";
import TitleBar from "@/components/TitleBar.vue";
import { Options as Component, Vue } from "vue-class-component";
import { registerServices } from "@/services/service-container";

@Component({
  components: {
    Footer,
    NavBar,
    TitleBar
  }
})
export default class App extends Vue {
  async created() {
    registerServices();
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/settings";

body {
  margin: 0;
}

main {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

p {
  font-weight: 300;
  line-height: 30px;
  margin: 0;
  size: 14px;
}

#app {
  color: $colour-text;
}

#window {
  // The url below is a placeholder until we get a system for user generated images
  background-image: linear-gradient(90deg, #000000aa 20%, #00000000 70%),
    url(https://picsum.photos/1200/600);
  display: flex;
  flex-direction: column;
  height: $size-window-height;
  width: $size-window-width;
}

#window__content {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>

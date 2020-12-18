<template>
  <div id="window">
    <div id="title-bar" />
    <main>
      <Nav-Bar />
      <router-view />
    </main>
    <Footer
      :marqueeText="getPatrons"
    />
  </div>
</template>

<script>
import Footer from './components/Footer.vue'
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    Footer,
    NavBar
  },
  computed: {
    // TODO: This will need to be replaced with the system to get the actual Patrons
    getPatrons () {
      const patrons = []

      for (let i = 0; i < 10; i++) {
        patrons.push('JU12000')
      }

      return patrons
    }
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: 'Averta';
  src: url('./assets/fonts/Averta.ttf') format('truetype');
}

@font-face {
  font-family: 'Averta-Thin';
  src: url('./assets/fonts/Averta.ttf') format('truetype');
}

@font-face {
  font-family: 'Averta-Extra-Thin';
  src: url('./assets/fonts/Averta.ttf') format('truetype');
}

body {
  margin: 0px;
}

main {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

#app {
  color: #ffffff;
  font-family: 'Averta';
}

#title-bar {
  position: absolute;
  height: 30px;
  top: 0;
  width: 100%;
}

#window {
  // The url below is a placeholder until we get a system for user generated images
  background-image: url(https://picsum.photos/1200/600);
  display: flex;
  flex-direction: column;
  height: 580px;
  width: 1000px;
}
</style>

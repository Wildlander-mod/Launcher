<template>
  <div id="window">
    <main>
      <Nav-Bar />
      <div id="window__content">
        <Title-Bar />
        <router-view />
      </div>
    </main>
    <Footer
      :marqueeItems="getPatrons"
    />
  </div>
</template>

<script>
import Footer from '@/components/Footer.vue'
import NavBar from '@/components/NavBar.vue'
import TitleBar from '@/components/TitleBar.vue'

export default {
  name: 'App',
  components: {
    Footer,
    NavBar,
    TitleBar
  },
  computed: {
    // TODO: This will need to be replaced with the system to get the actual Patrons
    getPatrons () {
      const patrons = []

      for (let i = 0; i < 10; i++) {
        patrons.push(`JU12000 ${i}`)
      }

      return patrons
    }
  }
}
</script>

<style lang="scss">
@import url(./assets/scss/font-face.scss);

body {
  margin: 0px;
}

main {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

p {
  font-weight: 300;
  line-height: 30px;
  margin: 0px;
  size: 14px;
}

#app {
  color: #ffffff;
}

#window {
  // The url below is a placeholder until we get a system for user generated images
  background-image:
    linear-gradient(90deg, #000000aa 20%, #00000000 70%),
    url(https://picsum.photos/1200/600);
  display: flex;
  flex-direction: column;
  height: 580px;
  width: 1000px;
}

#window__content {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>

<template>
  <div id="window">
    <main>
      <nav>
        <h1>Nav</h1>
      </nav>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Footer
  }
}
</script>

<style lang="scss">
body {
  margin: 0px;
}

main {
  // The url below is a placeholder until we get a system for user generated images
  background-image: url(https://picsum.photos/1200/600);
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

nav {
  width: 20%;
}

#window {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 1200px;
}
</style>

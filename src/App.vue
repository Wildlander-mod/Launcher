<template>
  <div id="app">
    <b-container fluid class="mb-4">
      <b-row no-gutters>
        <b-col class="d-flex flex-grow" id="logo-container">
          <b-img height="40" src="./assets/logo.png" id="logo"/>
        </b-col>
        <b-col cols="12" md="auto" class="d-flex justify-content-end">
          <b-button @click="minimize"><b-icon icon="dash" /></b-button>
          <b-button @click="close"><b-icon icon="x" /></b-button>
        </b-col>
      </b-row>
    </b-container>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    close () {
      window.ipcRenderer.send('close')
    },
    minimize () {
      window.ipcRenderer.send('minimize')
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

#logo {
  -webkit-user-drag: none;
  -webkit-user-select: none;
}

#logo-container {
  -webkit-app-region: drag;
}
.navbutton {
    padding: 25px 100%;
  }
</style>

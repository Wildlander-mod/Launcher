<template>
<span>
  <iframe src="https://www.ultimateskyrim.com/news" height="485px" width="100%"/>
  <p style='float:right'><b-img :src="require('../assets/azura.png')" height="25"/> Powered by <b-link @click="followLink('https://github.com/RingComics/azuras-star')">Azura's Star</b-link></p>
</span>
</template>

<script>
export default {
  name: 'RightPanel',
  methods: {
    followLink (value) {
      window.ipcRenderer.send('follow-link', value)
    }
  }
}
</script>

<style lang="scss">

</style>

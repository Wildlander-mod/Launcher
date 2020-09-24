<template>
  <b-container fluid class="text-center">
    <h2>Configure ENB Settings</h2>
    <p>Current ENB: {{ this.currentENB }}</p>
    <b-button v-on:click="clearENB">Don't use ENB</b-button>
    <b-button v-on:click="addENB">Add an ENB Profile</b-button>
    <br />
    <ENBProfile v-for="profile in profiles" :key="profile.id" :profile="profile" />
  </b-container>
</template>

<script>
import ENBProfile from '../components/ENBProfile.vue'

export default {
  name: 'ENB',
  components: {
    ENBProfile
  },
  data () {
    return {
      currentENB: '',
      profiles: []
    }
  },
  methods: {
    clearENB () {
      console.log('clear')
    },
    addENB () {
      console.log('add')
    }
  }
}
</script>

<style lang="scss">

</style>

<template>
  <b-container fluid>
    <b-form @submit="launchGame" novalidate>
      <b-select v-model="performanceProfile" label="Performance Profile">
        <b-select-option value="Low" class="ml-2">Low</b-select-option>
        <b-select-option value="Medium" class="ml-2">Medium</b-select-option>
        <b-select-option value="High" class="ml-2">High</b-select-option>
      </b-select>
      <b-button type="submit" variant="primary">Launch Ultimate Skyrim</b-button>
    </b-form>
    <br />
    <b-button :pressed="this.currentMenu === 'enb'" @click="changeMenu('enb')">Configure ENB</b-button>
    <b-button>Open ModOrganizer 2</b-button>
    <b-button :pressed="this.currentMenu === 'options'" @click="changeMenu('options')">Options</b-button>
    <b-link v-for="link in links" :key="link.name" @click="followLink(link.href)">
      {{ link.name }}
    </b-link>
  </b-container>
</template>

<script>
export default {
  name: 'LeftPanel',
  data () {
    return {
      // Ideally we would get this from a saved config on launch and populate
      performanceProfile: '',
      currentMenu: '',
      links: [
        { name: 'Website', href: 'https://www.ultimateskyrim.com' },
        { name: 'Patreon', href: 'https://www.patreon.com/dylanbperry' },
        { name: 'Discord', href: 'https://discord.gg/8VkDrfq' },
        { name: 'Reddit', href: 'https://www.reddit.com/r/ultimateskyrim' },
        { name: 'YouTube', href: 'https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww' },
        { name: 'Twitch', href: 'https://www.twitch.tv/dylanbperry' },
        { name: 'Subscribe to Newsletter', href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
      ]
    }
  },
  methods: {
    launchGame () {
      // Here we would launch the game, doi.
      console.log('I\'m Todd Howard, and I approve this message.')
    },
    changeMenu (value) {
      if (this.$route.path.endsWith(value)) {
        this.$router.push('/')
        this.currentMenu = ''
      } else {
        this.$router.push(value)
        this.currentMenu = value
      }
    },
    followLink (value) {
      window.ipcRenderer.send('follow-link', value)
    },
    refreshConfig () {
      window.ipcRenderer.invoke('get-config').then((result) => {
        this.performanceProfile = result.Options.DefaultPreset
      })
    }
  },
  beforeMount () {
    this.refreshConfig()
  }
}
</script>

<style lang="scss">

</style>

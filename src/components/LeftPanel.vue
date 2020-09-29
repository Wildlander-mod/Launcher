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
    <b-button @click="launchMO2">Open ModOrganizer 2</b-button>
    <b-button :pressed="this.currentMenu === 'options'" @click="changeMenu('options')">Options</b-button><br/>
    <b-link v-for="link in links" :key="link.name" @click="followLink(link.href)">
      {{ link.name }}
    </b-link>
    <b-modal ref="warn-no-preset" title="No performance preset selected!" hide-footer>
      <b-form @submit="this.$refs['warn-no-preset'].hide()">
        <p class="text-center">
          Please select a preset before launching the game!
        </p>
        <b-button type="submit" variant="outline-primary">OK</b-button>
      </b-form>
    </b-modal>
    <b-modal ref="warn-no-directory" title="Game directory not set!" hide-footer>
      <b-form @submit="saveConfig">
        <p class="text-center">
          We could not find your Skyrim directory! Please enter it below or click browse to find it
        </p>
        <input type="text" id='input-directory' v-model="GameDirectory"><input type="button" @click='getDirectory' value='Browse'>
        <b-button type="submit" variant="outline-primary">OK</b-button>
      </b-form>
    </b-modal>
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
      GameDirectory: '',
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
      if (this.performanceProfile === '') {
        this.$refs['warn-no-preset'].show()
      } else {
        window.ipcRenderer.invoke('launch-game', this.performanceProfile)
      }
    },
    launchMO2 () {
      window.ipcRenderer.invoke('launch-mo2')
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
    getDirectory () {
      window.ipcRenderer.invoke('get-directory').then((result) => {
        if (result !== undefined) { this.GameDirectory = result[0] }
      })
    },
    saveConfig () {
      window.ipcRenderer.invoke('get-config').then((result) => {
        result.Options.GameDirectory = this.GameDirectory
        window.ipcRenderer.invoke('update-config', result)
        this.$refs['warn-no-directory'].hide()
      })
    }
  },
  mounted () {
    window.ipcRenderer.invoke('get-config').then((result) => {
      this.performanceProfile = result.Options.DefaultPreset
      this.GameDirectory = result.Options.GameDirectory
      if (this.GameDirectory === '') {
        this.$refs['warn-no-directory'].show()
      }
    })
  }
}
</script>

<style lang="scss">

</style>

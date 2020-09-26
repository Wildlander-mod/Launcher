<template>
  <div>
    <h2>Launcher Settings</h2>
    <b-form @submit="saveConfig">
      <span>Skyrim directory: <p>{{ this.GameDirectory }}</p></span>
      <b-button @click="showModal('open-folder-dialog')">Browse</b-button><br/><br/>

      <span>Default Preset</span>
      <b-select v-model="DefaultProfile" label="Performance Profile">
        <b-select-option value="Low" class="ml-2">Low</b-select-option>
        <b-select-option value="Medium" class="ml-2">Medium</b-select-option>
        <b-select-option value="High" class="ml-2">High</b-select-option>
      </b-select>

      <b-button type="submit" variant="primary">Apply</b-button>
    </b-form>

    <b-modal ref="open-folder-dialog" title="Get Skyrim Directory" hide-footer>
      <b-form @submit="getDirectory">
        <p class="text-center">
          Please select your Skyrim installation folder
        </p>
        <b-button type="submit" variant="outline-primary">OK</b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'Options',
  data () {
    return {
      GameDirectory: '',
      DefaultProfile: '',
      currentConfig: ''
    }
  },
  methods: {
    loadConfig () {
      window.ipcRenderer.invoke('get-config').then((result) => {
        this.GameDirectory = result.Options.GameDirectory
        this.DefaultProfile = result.Options.DefaultPreset
        this.currentConfig = result
      })
    },
    saveConfig () {
      this.currentConfig.Options.GameDirectory = this.GameDirectory
      this.currentConfig.Options.DefaultPreset = this.DefaultProfile
      window.ipcRenderer.invoke('update-config', this.currentConfig)
    },
    getDirectory () {
      window.ipcRenderer.invoke('get-directory').then((result) => {
        if (result !== undefined) { this.GameDirectory = result[0] }
      })
      this.$refs['open-folder-dialog'].hide()
    },
    showModal (name) {
      this.$refs[name].show()
    }
  },
  beforeMount () {
    this.loadConfig()
  }
}
</script>

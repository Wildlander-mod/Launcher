<template>
  <b-container fluid class="text-center">
    <b-overlay :show="loading">
      <h2>Configure ENB Settings</h2>
      <p>Current ENB: {{ this.activeENBProfile }}</p>
      <b-button @click="loadENBProfile('')">Don't use ENB</b-button>
      <b-button @click="showModal('add-enb-modal')">Add an ENB Profile</b-button>
      <br />
      <ENBProfile
        v-for="profile in profiles"
        :key="profile.id"
        :name="profile.name"
        :isActive="profile.name === activeENBProfile"
        @load="loadENBProfile($event)"
        @configure="configureENBProfile($event)"
        @delete="confirmDeleteENBProfile($event)"
      />
    </b-overlay>
    <b-modal ref="add-enb-modal" title="Name Your Profile" hide-footer>
      <b-form @submit="createENBProfile">
        <b-form-input required placeholder="Enter a name." v-model="addModal.name" />
        <b-button type="submit" variant="primary">OK</b-button>
      </b-form>
    </b-modal>
    <b-modal ref="delete-enb-modal" title="Delete Your Profile" hide-footer>
      <b-form @submit="deleteENBProfile">
        <p class="text-center">
          Are you sure you want to delete {{ this.deleteModal.name }}?
        </p>
        <b-button type="submit" variant="danger">Delete</b-button>
      </b-form>
    </b-modal>
  </b-container>
</template>

<script>
import ENBProfile from '../components/ENB/ENBProfile.vue'

export default {
  name: 'ENB',
  components: {
    ENBProfile
  },
  data () {
    return {
      loading: false,
      // We should get this from the settings on-load
      activeENBProfile: '',
      profiles: [],
      addModal: {
        name: ''
      },
      deleteModal: {
        name: ''
      }
    }
  },
  methods: {
    showModal (name) {
      this.$refs[name].show()
    },
    createENBProfile () {
      this.loading = true
      this.$refs['add-enb-modal'].hide()

      window.ipcRenderer.invoke('create-enb-profile', this.addModal.name).then((result) => {
        this.activeENBProfile = result.name
        this.profiles.push(result)

        this.loading = false
      }).catch((error) => {
        // Do some error handling here
        console.log(error)
      })
    },
    loadENBProfile (name) {
      this.loading = true

      // Do actual ENB switching in an ipcRenderer.invoke() here
      // Also make sure to update the currentENB in the config

      this.activeENBProfile = name
      this.loading = false
    },
    configureENBProfile (name) {
      const profile = this.profiles.find(x => x.name === name)

      window.ipcRenderer.send('configure-enb-profile', profile.path)
    },
    confirmDeleteENBProfile (name) {
      this.deleteModal.name = name
      this.showModal('delete-enb-modal')
    },
    deleteENBProfile () {
      this.loading = true
      this.$refs['delete-enb-modal'].hide()

      const profile = this.profiles.find(x => x.name === this.deleteModal.name)

      window.ipcRenderer.invoke('delete-enb-profile', profile).then((result) => {
        if (this.activeENBProfile === this.deleteModal.name) {
          this.activeENBProfile = ''
        }

        this.profiles = this.profiles.filter(x => x.name !== this.deleteModal.name)
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss">

</style>

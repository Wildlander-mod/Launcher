<template>
  <b-container fluid>
    <b-row no-gutters>
      <b-col cols="3">
        <LeftPanel/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import LeftPanel from '../components/LeftPanel.vue'

export default {
  name: 'Home',
  components: {
    LeftPanel
  }
}
</script>

<style lang="scss">

</style>

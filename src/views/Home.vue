<template>
  <b-container fluid>
    <b-row no-gutters>
      <b-col cols="3">
        <LeftPanel />
      </b-col>
      <b-col>
        <CenterPanel />
      </b-col>
      <b-col>
        <RightPanel />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import LeftPanel from '../components/LeftPanel.vue'
import CenterPanel from '../components/CenterPanel.vue'
import RightPanel from '../components/RightPanel.vue'

export default {
  name: 'Home',
  components: {
    LeftPanel,
    CenterPanel,
    RightPanel
  }
}
</script>

<style lang="scss">

</style>

<template>
  <nav>
    <Button
      id="button-launch"
      text="Launch Game"
      type="primary"
      size="large"
    />
    <Select
      :options="qualityOptions"
      id="select-quality"
      placeholder="Quality"
    />
    <Select
      id="select-enb"
      placeholder="No ENB"
    />
  </nav>
</template>

<script>
import Button from './controls/Button.vue'
import Select from './controls/Select.vue'

export default {
  name: 'Nav-Bar',
  components: {
    Button,
    Select
  },
  data () {
    return {
      qualityOptions: [
        {
          name: 'Low Quality',
          value: 'low'
        },
        {
          name: 'Medium Quality',
          value: 'medium'
        },
        {
          name: 'High Quality',
          value: 'high'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
nav {
  backdrop-filter: blur(20px);
  background: #e1e1e133;
  display: flex;
  flex-direction: column;
  height: 550px;
  width: 225px;

  #button-launch {
      align-self: center;
      margin-top: 30px;
  }

  [id^='select-'] {
    align-self: center;
    margin-top: 10px;
  }
}
</style>

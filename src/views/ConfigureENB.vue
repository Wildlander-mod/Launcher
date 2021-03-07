<template>
  <div id="configure-enb">
    <p id="configure-enb__title">Configure ENB</p>
    <div id="configure-enb__controls">
      <p>Current ENB: {{ currentENB.name }}</p>
      <div id="controls__button-wrapper">
        <div id="controls__primary-buttons">
          <Button text="New ENB Profile" type="primary" size="large" />
        </div>
        <div id="controls__secondary-buttons">
          <Button text="Load" />
          <Button text="Open" />
          <Button text="Delete" />
        </div>
      </div>
    </div>
    <div v-if="enbs.length" id="configure-enb__selector">
      <h1>Hi</h1>
    </div>
  </div>
</template>

<script>
import Button from "../components/controls/Button.vue";

export default {
  name: "ConfigureENB",
  components: {
    Button,
  },
  data() {
    return {
      currentENB: {
        name: "None",
      },
      enbs: [],
    };
  },
};
</script>

<style lang="scss" scoped>
#configure-enb {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 20px;

  #configure-enb__controls {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #ffffff48;
    display: flex;
    flex-direction: column;

    #controls__button-wrapper {
      display: flex;
      margin: 20px 30px 20px 30px;

      #controls__primary-buttons {
        width: 55%;
      }

      #controls__secondary-buttons {
        display: flex;
        justify-content: space-around;
        flex-grow: 1;
      }
    }

    p {
      font-size: 18px;
      margin-left: 30px;
      margin-top: 20px;
    }
  }

  #configure-enb__selector {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #ffffff48;
    height: 225px;
    margin-top: -1px;
  }

  #configure-enb__title {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>

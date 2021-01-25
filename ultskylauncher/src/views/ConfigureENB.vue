<template>
  <div id="configure-enb">
    <p id="configure-enb__title">Configure ENB</p>
    <div id="configure-enb__wrapper">
      <p id="configure-enb__active-enb">Current ENB: {{ currentENB.name }}</p>
      <div id="controls-container__controls">

      </div>
      <hr />
      <div id="container__list">

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfigureENB',
  data () {
    return {
      currentENB: {
        name: 'None'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#configure-enb {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-top: 20px;

  #configure-enb__container {
    backdrop-filter: blur(10px);
    background-color: #00000080;
    border: 1px solid #ffffff33;
    display: flex;
    flex-direction: column;
    height: 325px;
    margin-top: 5px;
    width: 700px;

    #container__controls-wrapper {
      height: 125px;

      #controls-container__subtitle {
        font-size: 18px;
        margin-left: 30px;
        margin-top: 20px;
      }
    }

    #container__list {
      height: 198px;
    }

    hr {
      border-color: #ffffff33;
      margin: 0px;
      width: 100%;
    }
  }

  #configure-enb__title {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>

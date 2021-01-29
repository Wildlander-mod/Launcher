<template>
  <div id="resources">
    <p id="resources__title">
      Resources
    </p>
    <div id="resources__container-background">
      <div id="resources__row-container">
        <div class="resources__row">
          <div class="resources__link-container">
            <Patreon
              width="30px"
              height="30px"
            />
          </div>
          <div class="resources__link-container">
            <img src="" />
          </div>
          <div class="resources__link-container">
            <img src="" />
          </div>
          <div class="resources__link-container">
            <img src="" />
          </div>
        </div>
        <div class="resources__row">
          <div class="resources__link-container">
            <img src="" />
          </div>
          <div class="resources__link-container">
            <img src="" />
          </div>
          <div class="resources__link-container">
            <img src="" />
          </div>
          <div class="resources__link-container">
            <img src="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Patreon from '@/components/svg/Patreon.vue'

export default {
  name: 'Resources',
  components: {
    Patreon
  }
}
</script>

<style lang="scss" scoped>
#resources {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 20px;

  #resources__container-background {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #ffffff48;
    height: 350px;

    #resources__row-container {
      display: flex;
      flex-direction: column;
      height: 290px;
      justify-content: space-between;
      margin: 30px;

      .resources__row {
        display: flex;
        justify-content: space-between;

        .resources__link-container {
          align-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid #ffffff48;
          display: flex;
          height: 125px;
          justify-content: center;
          width: 150px;
        }
      }
    }
  }

  #resources__title {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>

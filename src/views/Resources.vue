<template>
  <div id="resources">
    <p id="resources__title">Resources</p>
    <div id="resources__wrapper">
      <div class="resources__row">
        <div class="resources__link-container">
          <PatreonLogo size="50" />
          <p>Patreon</p>
        </div>
        <div class="resources__link-container">
          <WebsiteLogo size="50" />
          <p>Website</p>
        </div>
        <div class="resources__link-container">
          <YouTubeLogo size="50" />
          <p>YouTube</p>
        </div>
        <div class="resources__link-container"></div>
      </div>
      <div class="resources__row">
        <div class="resources__link-container"></div>
        <div class="resources__link-container"></div>
        <div class="resources__link-container"></div>
        <div class="resources__link-container"></div>
      </div>
    </div>
  </div>
</template>

<script>
import PatreonLogo from "@/components/svgs/PatreonLogo.vue";
import WebsiteLogo from "@/components/svgs/WebsiteLogo.vue";
import YouTubeLogo from "@/components/svgs/YouTubeLogo.vue";

export default {
  name: "Resources",
  components: {
    PatreonLogo,
    WebsiteLogo,
    YouTubeLogo,
  },
};
</script>

<style lang="scss" scoped>
#resources {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 20px;

  #resources__wrapper {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #ffffff48;
    height: 350px;

    .resources__row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-left: 30px;
      margin-right: 30px;
      margin-top: 30px;

      .resources__link-container {
        align-items: center;
        border: 1px solid #ffffff48;
        display: flex;
        flex-direction: column;
        height: 125px;
        justify-content: center;
        width: 150px;

        &:hover {
          background-color: rgba(81, 81, 81, 0.5);
        }

        p {
          font-size: 12px;
          font-weight: 300px;
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

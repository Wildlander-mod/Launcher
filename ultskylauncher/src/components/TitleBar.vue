<template>
  <div id="title-bar">
    <div id="title-bar__controls">
      <span
        @click="minimize"
        class="material-icons"
      >
        remove
      </span>
      <span
        @click="close"
        class="material-icons"
      >
        close
      </span>
    </div>
    <div id="title-bar__title">
      <Logo
        fill="#ffffff"
        height="30px"
      />
      <p>
        Choose a performance preset and the click "Launch Game" to play!
        <br>
        Use the side navigation to edit or change your ENB and launcher settings.
      </p>
    </div>
  </div>
</template>

<script>
import Logo from '@/components/svg/Logo.vue'

export default {
  name: 'TitleBar',
  components: {
    Logo
  }
}
</script>

<style lang="scss" scoped>
div {
  height: 100px;

  #title-bar__controls {
    height: 30px;
    text-align: end;

    span:hover {
      cursor: pointer;
    }
  }

  #title-bar__title {
    margin-left: 30px;

    p {
      color: #ffffff99;
      font-size: 12px;
      line-height: 15px;
      margin-top: 10px;
      width: 450px;
    }
  }
}
</style>

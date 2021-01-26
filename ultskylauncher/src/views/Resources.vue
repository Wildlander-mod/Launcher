<template>
  <div id="resources">
    <p id="resources__title">
      Resources
    </p>
    <div id="resources__link-box">

    </div>
  </div>
</template>

<script>
export default {
  name: 'Resources'
}
</script>

<style lang="scss" scoped>
#resources {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 20px;

  #resources__link-box {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #ffffff48;
    height: 350px;
  }

  #resources__title {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>

<template>
  <div id="news-box"></div>
</template>

<script>
export default {
  name: "NewsBox",
};
</script>

<style lang="scss" scoped>
@import "src/assets/scss/settings/colours";

#news-box {
  backdrop-filter: blur(10px);
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--darker;
  height: 120px;
  margin-top: 5px;
  width: 100%;
}
</style>

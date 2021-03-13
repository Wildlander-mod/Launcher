<template>
  <div id="patron-box"></div>
</template>

<script>
export default {
  name: "PatronBox"
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/settings";

#patron-box {
  backdrop-filter: blur(10px);
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--darker;
  height: 200px;
  margin-top: 5px;
  width: 100%;
}
</style>

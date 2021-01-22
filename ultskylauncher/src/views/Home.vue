<template>
  <div id="home">
    <div class="home__section">
      <p>News</p>
      <NewsBox />
    </div>
    <div class="home__section">
      <p>Patron Highlight</p>
      <PatronBox />
    </div>
  </div>
</template>

<script>
import NewsBox from '@/components/NewsBox.vue'
import PatronBox from '@/components/PatronBox.vue'

export default {
  name: 'Home',
  components: {
    NewsBox,
    PatronBox
  }
}
</script>

<style lang="scss" scoped>
#home {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  width: 350px;

  .home__section {
    margin-top: 20px;
  }

  p {
    font-size: 18px;
  }
}
</style>

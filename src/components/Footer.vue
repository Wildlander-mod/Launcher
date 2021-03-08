<template>
  <footer>
    <p>Thanks to all the Patrons!</p>
    <Marquee :items="patrons" />
  </footer>
</template>

<script>
import Marquee from "./Marquee.vue";

export default {
  name: "Footer",
  components: {
    Marquee,
  },

  data() {
    return {
      patrons: [],
    };
  },

  methods: {
    async getPatrons() {
      const patrons = [];

      for (let i = 0; i < 10; i++) {
        patrons.push(`JU12000 ${i}`);
      }

      return new Promise(() => {
        this.patrons = patrons;
      });
    },
  },

  async created() {
    await this.getPatrons();
  },
};
</script>

<style lang="scss" scoped>
footer {
  background-color: #000000;
  display: flex;
  height: 30px;

  p {
    font-weight: 600;
    margin-left: 8px;
    white-space: nowrap;
  }
}
</style>

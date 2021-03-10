<template>
  <footer v-if="patrons && patrons.length > 0">
    <p>Thanks to all the Patrons!</p>
    <Marquee :items="patrons" />
  </footer>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Marquee from "./Marquee.vue";

interface Patron {
  name: string;
  tier: "Patron" | "Super Patron";
}

@Options({
  components: {
    Marquee
  }
})
export default class Footer extends Vue {
  patrons: string[] = [];

  async getPatrons() {
    try {
      const response = await fetch("https://ultsky.phinocio.com/api/patreon");
      const data = await response.json();
      // Shuffle the array to show different Patrons each time
      this.patrons = this.shuffleArray(
        data.patrons.map((patron: Patron) => patron.name)
      );
    } catch (error) {
      throw new Error(`Failed to get Patrons: ${error}`);
    }
  }

  /**
   * Taken from https://stackoverflow.com/a/12646864/3379536
   */
  shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async created() {
    await this.getPatrons();
  }
}
</script>

<style lang="scss" scoped>
@import "src/assets/scss/settings/colours";

footer {
  background-color: $colour-background-secondary;
  display: flex;
  height: 30px;

  p {
    font-weight: 600;
    margin-left: 8px;
    white-space: nowrap;
  }
}
</style>

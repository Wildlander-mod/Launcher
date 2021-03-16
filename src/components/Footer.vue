<template>
  <footer>
    <p>Thanks to all the Patrons!</p>
    <Marquee
      v-if="patronNames && patronNames.length > 0"
      :items="patronNames"
    />
  </footer>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import Marquee from "./Marquee.vue";
import { PatreonService } from "@/services/Patreon.service";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";

@Component({
  components: {
    Marquee
  }
})
export default class Footer extends Vue {
  patreonService!: PatreonService;
  patronNames: string[] = [];

  async created() {
    this.patreonService = injectStrict(SERVICE_BINDINGS.PATRON_SERVICE);
    const patrons = await this.patreonService.getPatrons();
    this.patronNames = patrons.map(patron => patron.name);
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

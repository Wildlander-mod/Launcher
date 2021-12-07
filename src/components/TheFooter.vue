<template>
  <footer class="c-footer">
    <p class="c-footer__text">
      <BaseLink href="https://www.patreon.com/dylanbperry">
        Thanks to all the Patrons!
      </BaseLink>
    </p>
    <BaseMarquee
      v-if="patronNames && patronNames.length > 0"
      :items="patronNames"
    />
    <p v-else-if="cannotGetPatrons" class="c-footer__text">
      Could not retrieve Patron list.
    </p>
  </footer>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import BaseMarquee from "./BaseMarquee.vue";
import { PatreonService } from "@/services/patreon.service";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import BaseLink from "@/components/BaseLink.vue";
import { logger } from "@/main/logger";

@Component({
  components: {
    BaseMarquee,
    BaseLink,
  },
})
export default class TheFooter extends Vue {
  patreonService!: PatreonService;
  patronNames: string[] = [];
  cannotGetPatrons = false;

  async created() {
    this.patreonService = injectStrict(SERVICE_BINDINGS.PATRON_SERVICE);

    try {
      const patrons = await this.patreonService.getPatrons();
      this.patronNames = patrons.map((patron) => patron.name);
    } catch (error) {
      logger.error(`Cannot get Patrons ${error}`);
      this.cannotGetPatrons = true;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-footer {
  background-color: $colour-background-secondary;
  display: flex;
  height: 30px;
  line-height: $line-height--x-large;
}

.c-footer__text {
  font-weight: 600;
  margin-left: 8px;
  white-space: nowrap;
}
</style>

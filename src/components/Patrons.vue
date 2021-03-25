<template>
  <div class="c-patrons">
    <List :items="superPatrons">
      <div class="c-patrons__title">
        <div class="l-column l-center">
          <div class="c-patrons__star--stacked">
            <i class="material-icons c-patrons__star-icon">star_outline</i>
          </div>
          <div class="c-patrons__star--stacked">
            <i class="material-icons c-patrons__star-icon">star_outline</i>
            <i class="material-icons c-patrons__star-icon c-patrons__star-icon"
              >star_outline</i
            >
          </div>
        </div>
        <div class="c-patrons__title-text">
          Super Patron
        </div>
      </div>
    </List>
    <List :items="otherPatrons">
      <div class="c-patrons__title">
        <div class="c-patrons__star">
          <i class="material-icons c-patrons__star-icon">star_outline</i>
        </div>
        <div class="c-patrons__title-text">
          Patron
        </div>
      </div>
    </List>
  </div>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import List from "./List.vue";
import { PatreonService } from "@/services/Patreon.service";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";

@Component({
  components: {
    List
  }
})
export default class Patrons extends Vue {
  patreonService!: PatreonService;
  superPatrons: string[] = [];
  otherPatrons: string[] = [];

  async created() {
    this.patreonService = injectStrict(SERVICE_BINDINGS.PATRON_SERVICE);
    const patrons = await this.patreonService.getPatrons();

    this.superPatrons = patrons
      .filter(patron => patron.tier === "Super Patron")
      .map(patron => patron.name);

    this.otherPatrons = patrons
      .filter(patron => patron.tier === "Patron")
      .map(patron => patron.name);
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/index.scss";

// The size and positioning of the "star" icons are heavily tied together
// Changing the size of one will likely need all of these adjusting to fit
$star-single-size: 18px;
$star-stacked-container: 7px;
$star-stacked-width: 8px;
$star-stacked-size: 10px;

.c-patrons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  flex: 1;
}

.c-patrons__title {
  display: flex;
  flex-direction: row;
}

.c-patrons__title-text {
  margin-left: 5px;
}

.c-patrons__star {
  height: $star-single-size;
  font-size: $star-single-size;
}

.c-patrons__star--stacked {
  height: $star-stacked-container;
  font-size: $star-stacked-size;
}

.c-patrons__star-icon {
  font-size: 1em;
  line-height: 1em;

  .c-patrons__star--stacked & {
    width: $star-stacked-width;
  }

  color: $colour-star;
}
</style>

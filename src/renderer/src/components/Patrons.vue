<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="c-patrons" data-testid="patrons-container">
    <BaseList
      v-if="!failedToGetPatrons && superPatrons.length !== 0"
      :items="superPatrons"
      class="c-patrons__list"
      data-testid="super-patrons-list"
    >
      <div class="c-patrons__title">
        <div class="l-column l-center-text">
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
        <div class="c-patrons__title-text l-flex-grow">Super Patrons</div>
      </div>
    </BaseList>
    <BaseList
      v-if="!failedToGetPatrons && otherPatrons.length !== 0"
      :items="otherPatrons"
      data-testid="patrons-list"
    >
      <div class="c-patrons__title">
        <div class="c-patrons__star">
          <i class="material-icons c-patrons__star-icon">star_outline</i>
        </div>
        <div class="c-patrons__title-text">Patrons</div>
      </div>
    </BaseList>
    <div v-if="failedToGetPatrons" data-testid="patrons-error">
      Unable to retrieve Patron list.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseList from "./BaseList.vue";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";

const patreonService = injectStrict(SERVICE_BINDINGS.PATRON_SERVICE);

const superPatrons = ref<string[]>([]);
const otherPatrons = ref<string[]>([]);
const failedToGetPatrons = ref(false);

onMounted(async () => {
  try {
    const patrons = await patreonService.getPatrons();
    superPatrons.value = patrons
      .filter((patron) => patron.tier === "Super Patron")
      .map((patron) => patron.name);

    otherPatrons.value = patrons
      .filter((patron) => patron.tier === "Patron")
      .map((patron) => patron.name);
  } catch {
    failedToGetPatrons.value = true;
  }
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/index";

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

  word-break: break-all;
}

.c-patrons__list {
  max-width: 50%;
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

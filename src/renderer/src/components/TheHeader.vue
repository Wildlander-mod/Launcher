<template>
  <div class="c-header l-row l-space-between">
    <BaseImage
      :image-source="defaultLogo"
      :alt="modpack.name"
      class="c-header__image"
    />

    <div class="c-header__links l-row l-no-flex-grow">
      <div v-if="modpack.website" class="c-header__link l-center-vertically">
        <BaseLink
          :href="modpack.website"
          :hover-style="true"
          data-testid="website-link"
          >Website
        </BaseLink>
      </div>
      <div v-if="modpack.wiki" class="c-header__link l-center-vertically">
        <BaseLink
          :href="modpack.wiki"
          :hover-style="true"
          data-testid="wiki-link"
          >Wiki</BaseLink
        >
      </div>
      <div v-if="modpack.roadmap" class="c-header__link l-center-vertically">
        <BaseLink
          :href="modpack.roadmap"
          :hover-style="true"
          data-testid="roadmap-link"
          >Roadmap</BaseLink
        >
      </div>
      <div v-if="modpack.patreon" class="c-header__link l-center-vertically">
        <BaseLink
          :href="modpack.patreon"
          :hover-style="true"
          data-testid="patreon-link"
          >Patreon
        </BaseLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WildlanderModpack } from "../../../shared/wildlander/modpack";
import BaseLink from "./BaseLink.vue";
import BaseImage from "./BaseImage.vue";

const modpack = WildlanderModpack;
const defaultLogo = "./images/logos/wildlander-full-light.svg";
</script>

<style scoped lang="scss">
@use "../assets/scss/index" as *;

// Specific margin to enable the logo to sit more visually aligned with the links
// This is due to the logo having a heavily weighted top compared to the bottom
$logoMargin: 2px;

.c-header {
  // The head links need a bit more space than normal due to their sizing
  margin-left: $size-spacing--x-large;
  margin-right: $size-spacing--x-large;
}

.c-header__link {
  margin-left: $size-spacing--large + $size-spacing--x-small;
  font-size: $font-size--large;
}

.c-header__image {
  margin-top: $logoMargin;
}

.c-header__links {
  margin-top: -$logoMargin;
}
</style>

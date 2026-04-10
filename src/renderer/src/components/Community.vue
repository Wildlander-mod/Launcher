<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="c-resources l-row">
    <BaseLink
      href="https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww"
      class="c-resource l-flex"
    >
      <ImageWithText
        image-source="./images/logos/youtube.svg"
        alt=""
        text="YouTube"
      />
    </BaseLink>
    <BaseLink
      href="https://www.twitch.tv/dylanbperry"
      class="c-resource l-flex"
    >
      <ImageWithText
        image-source="./images/logos/twitch.svg"
        alt=""
        text="Twitch"
      />
    </BaseLink>
    <BaseLink href="https://discord.gg/8VkDrfq" class="c-resource l-flex">
      <ImageWithText
        image-source="./images/logos/discord.svg"
        alt=""
        text="Discord"
      />
    </BaseLink>
    <BaseLink href="https://reddit.com/r/wildlander" class="c-resource l-flex">
      <ImageWithText
        image-source="./images/logos/reddit.svg"
        alt=""
        text="Reddit"
      />
    </BaseLink>
  </div>
</template>

<script setup lang="ts">
import BaseLink from "./BaseLink.vue";
import ImageWithText from "./ImageWithText.vue";
</script>

<style scoped lang="scss">
@import "../assets/scss/index";

.c-resources {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  :nth-child(4n),
  :last-child {
    margin-right: 0;
  }
}

.c-resource {
  margin-right: $size-spacing;

  padding-top: $size-spacing--x-large;
  padding-bottom: $size-spacing--x-large;

  border: 1px solid $colour-background--dark;

  &:hover {
    background: $colour-background--transparent;
  }
}

.c-resource__text {
  margin-top: $size-spacing;
}
</style>

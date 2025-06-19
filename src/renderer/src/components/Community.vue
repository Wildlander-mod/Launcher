<template>
  <div class="c-resources l-row">
    <BaseLink
      href="https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww"
      class="c-resource l-flex"
    >
      <ImageWithText :image-source="youtubeLogo" alt="" text="YouTube" />
    </BaseLink>
    <BaseLink
      href="https://www.twitch.tv/dylanbperry"
      class="c-resource l-flex"
    >
      <ImageWithText :image-source="twitchLogo" alt="" text="Twitch" />
    </BaseLink>
    <BaseLink href="https://discord.gg/8VkDrfq" class="c-resource l-flex">
      <ImageWithText :image-source="discordLogo" alt="" text="Discord" />
    </BaseLink>
    <BaseLink href="https://reddit.com/r/wildlander" class="c-resource l-flex">
      <ImageWithText :image-source="redditLogo" alt="" text="Reddit" />
    </BaseLink>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPageContent from "./AppPageContent.vue";
import AppPage from "./AppPage.vue";
import BaseLink from "./BaseLink.vue";
import ImageWithText from "./ImageWithText.vue";
import type { Modpack } from "@/shared/types/modpack-metadata";
import modpack from "@/shared/wildlander/modpack.json";
import youtubeLogo from "../assets/images/logos/youtube.svg";
import twitchLogo from "../assets/images/logos/twitch.svg";
import discordLogo from "../assets/images/logos/discord.svg";
import redditLogo from "../assets/images/logos/reddit.svg";

@Options({
  components: {
    ImageWithText,
    BaseLink,
    AppPageContent,
    AppPage,
  },
})
export default class Community extends Vue {
  modpack!: Modpack;
  youtubeLogo = youtubeLogo;
  twitchLogo = twitchLogo;
  discordLogo = discordLogo;
  redditLogo = redditLogo;

  override async created() {
    this.modpack = modpack;
  }
}
</script>

<style scoped lang="scss">
@import "~@/renderer/src/assets/scss";

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

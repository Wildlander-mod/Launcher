<template>
  <div>
    <div class="c-resources">
      <BaseLink href="https://www.patreon.com/dylanbperry" class="c-resource">
        <LogoPatreon :size="50" />
        <div class="c-resource__text">Patreon</div>
      </BaseLink>
      <BaseLink href="https://www.ultimateskyrim.com/" class="c-resource">
        <LogoWebsite :size="50" />
        <div class="c-resource__text">Website</div>
      </BaseLink>
      <BaseLink
        href="https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww"
        class="c-resource"
      >
        <LogoYouTube :size="50" />
        <div class="c-resource__text">YouTube</div>
      </BaseLink>
      <BaseLink href="https://www.twitch.tv/dylanbperry" class="c-resource">
        <LogoTwitch size="50" />
        <div class="c-resource__text">Twitch</div>
      </BaseLink>
      <BaseLink href="https://discord.gg/8VkDrfq" class="c-resource">
        <LogoDiscord size="50" />
        <div class="c-resource__text">Discord</div>
      </BaseLink>
      <BaseLink href="https://reddit.com/r/ultimateskyrim" class="c-resource">
        <LogoReddit size="50" />
        <div class="c-resource__text">Reddit</div>
      </BaseLink>
      <BaseLink
        href="https://github.com/UltimateSkyrim/UltimateSkyrim/blob/master/Docs/FAQ.md"
        class="c-resource"
      >
        <LogoFAQ size="50" />
        <div class="c-resource__text">FAQ</div>
      </BaseLink>
      <BaseLink
        href="https://docs.google.com/document/d/1zLMnRAsaELhxB4wuzgRIWXhaVa8M-lPbbKotJHSCbH0/preview"
        class="c-resource"
      >
        <LogoNewPlayerGuide size="50" />
        <div class="c-resource__text">New player guide</div>
      </BaseLink>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPageContent from "@/components/AppPageContent.vue";
import AppPage from "@/components/AppPage.vue";
import LogoYouTube from "@/components/LogoYouTube.vue";
import LogoWebsite from "@/components/LogoWebsite.vue";
import LogoPatreon from "@/components/LogoPatreon.vue";
import LogoTwitch from "@/components/LogoTwitch.vue";
import LogoDiscord from "@/components/LogoDiscord.vue";
import LogoReddit from "@/components/LogoReddit.vue";
import LogoFAQ from "@/components/LogoFAQ.vue";
import LogoNewPlayerGuide from "@/components/LogoNewPlayerGuide.vue";
import BaseLink from "@/components/BaseLink.vue";

@Options({
  components: {
    BaseLink,
    LogoNewPlayerGuide,
    LogoFAQ,
    LogoReddit,
    LogoDiscord,
    LogoTwitch,
    AppPageContent,
    AppPage,
    LogoYouTube,
    LogoWebsite,
    LogoPatreon,
  },
})
export default class Resources extends Vue {}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-resources {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  :nth-child(4),
  :last-child {
    margin-right: 0;
  }
}

.c-resource {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 150px;
  height: 120px;
  margin-right: $size-spacing;
  margin-bottom: $size-spacing;

  border: 1px solid $colour-background--dark;

  &:hover {
    background: $colour-background--transparent;
  }
}

.c-resource__text {
  margin-top: $size-spacing;
}
</style>

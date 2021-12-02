<template>
  <div>
    <div class="c-resources">
      <BaseLink href="https://www.patreon.com/dylanbperry" class="c-resource">
        <ImageWithText
          image-source="images/logos/patreon.svg"
          alt=""
          text="Patreon"
        />
      </BaseLink>
      <BaseLink :href="modpack.website" class="c-resource">
        <ImageWithText
          image-source="images/logos/website.svg"
          alt=""
          text="Website"
        />
      </BaseLink>
      <BaseLink
        href="https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww"
        class="c-resource"
      >
        <ImageWithText
          image-source="images/logos/youtube.svg"
          alt=""
          text="YouTube"
        />
      </BaseLink>
      <BaseLink href="https://www.twitch.tv/dylanbperry" class="c-resource">
        <ImageWithText
          image-source="images/logos/twitch.svg"
          alt=""
          text="Twitch"
        />
      </BaseLink>
      <BaseLink href="https://discord.gg/8VkDrfq" class="c-resource">
        <ImageWithText
          image-source="images/logos/discord.svg"
          alt=""
          text="Discord"
        />
      </BaseLink>
      <BaseLink href="https://reddit.com/r/wildlander" class="c-resource">
        <ImageWithText
          image-source="images/logos/reddit.svg"
          alt=""
          text="Reddit"
        />
      </BaseLink>
      <BaseLink
        href="https://github.com/Wildlander-mod/Support/blob/master/Docs/SSEFAQ.md"
        class="c-resource"
      >
        <ImageWithText image-source="images/logos/faq.svg" alt="" text="FAQ" />
      </BaseLink>
      <BaseLink
        href="https://docs.google.com/document/d/1zLMnRAsaELhxB4wuzgRIWXhaVa8M-lPbbKotJHSCbH0/preview"
        class="c-resource"
      >
        <ImageWithText
          image-source="images/logos/new-player-guide.svg"
          alt=""
          text="New player guide"
        />
      </BaseLink>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPageContent from "@/components/AppPageContent.vue";
import AppPage from "@/components/AppPage.vue";
import BaseLink from "@/components/BaseLink.vue";
import ImageWithText from "@/components/ImageWithText.vue";
import { modpack, Modpack } from "@/main/config";

@Options({
  components: {
    ImageWithText,
    BaseLink,
    AppPageContent,
    AppPage,
  },
})
export default class Resources extends Vue {
  private modpack!: Modpack;

  created() {
    this.modpack = modpack;
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

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
  display: flex;

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

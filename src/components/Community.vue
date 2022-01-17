<template>
  <div class="c-resources l-row">
    <BaseLink
      v-if="modpack.youtube"
      :href="modpack.youtube"
      class="c-resource l-flex"
    >
      <ImageWithText
        image-source="images/logos/youtube.svg"
        alt=""
        text="YouTube"
      />
    </BaseLink>
    <BaseLink
      v-if="modpack.twitch"
      :href="modpack.twitch"
      class="c-resource l-flex"
    >
      <ImageWithText
        image-source="images/logos/twitch.svg"
        alt=""
        text="Twitch"
      />
    </BaseLink>
    <BaseLink
      v-if="modpack.discord"
      :href="modpack.discord"
      class="c-resource l-flex"
    >
      <ImageWithText
        image-source="images/logos/discord.svg"
        alt=""
        text="Discord"
      />
    </BaseLink>
    <BaseLink
      v-if="modpack.reddit"
      :href="modpack.reddit"
      class="c-resource l-flex"
    >
      <ImageWithText
        image-source="images/logos/reddit.svg"
        alt=""
        text="Reddit"
      />
    </BaseLink>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPageContent from "@/components/AppPageContent.vue";
import AppPage from "@/components/AppPage.vue";
import BaseLink from "@/components/BaseLink.vue";
import ImageWithText from "@/components/ImageWithText.vue";
import { modpack } from "@/main/config";
import { Modpack } from "@/modpack-metadata";

@Options({
  components: {
    ImageWithText,
    BaseLink,
    AppPageContent,
    AppPage,
  },
})
export default class Community extends Vue {
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

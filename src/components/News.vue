<template>
  <div v-if="!failedToGetNews && news.length > 0" class="c-news l-column">
    <div v-for="newsItem in news" :key="newsItem.key" class="c-news__item">
      <BaseLink :href="`https://www.patreon.com${newsItem.url}`" class="l-row">
        <div class="c-news__published l-center-vertically">
          {{ new Date(newsItem.published).toLocaleDateString() }}
        </div>

        <div class="c-news__title">
          {{ newsItem.title }}
        </div>
      </BaseLink>
    </div>
  </div>
  <div v-if="failedToGetNews && news.length === 0">
    Cannot load latest news. Please report this error in the modpack
    <BaseLink href="https://discordapp.com/invite/8VkDrfq" :underline="true"
      >Discord
    </BaseLink>
    .
  </div>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import BaseList from "./BaseList.vue";
import { Posts, PostsService } from "@/services/posts.service";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import BaseLink from "@/components/BaseLink.vue";

@Component({
  components: {
    BaseList,
    BaseLink,
  },
})
export default class News extends Vue {
  newsService!: PostsService;
  news: Posts[] = [];
  failedToGetNews = false;

  async created() {
    this.newsService = injectStrict(SERVICE_BINDINGS.NEWS_SERVICE);
    try {
      this.news = await this.newsService.getPosts();
    } catch {
      this.failedToGetNews = true;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

.c-news {
  font-size: $font-size--small;
  padding-top: $size-spacing--large;
}

.c-news__title {
  flex: 1;

  &:hover {
    text-decoration: underline;
  }
}

.c-news__item {
  margin-bottom: $size-spacing;
  padding-left: $size-spacing--large;
  padding-right: $size-spacing--large;

  &:hover {
    background-color: $colour-background--dark;
  }
}

.c-news__published {
  color: $colour-text-secondary;

  flex: 0.3;
}
</style>

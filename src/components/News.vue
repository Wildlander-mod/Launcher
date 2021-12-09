<template>
  <div v-if="!failedToGetNews && news.length > 0" class="c-news l-column">
    <div v-for="newsItem in news" :key="newsItem.key" class="c-news__item">
      <BaseLink :href="`https://www.patreon.com${newsItem.url}`" class="l-row">
        <div class="c-news__meta">
          <div class="c-news__published">
            {{ new Date(newsItem.published).toLocaleDateString() }}
          </div>

          <div class="c-news__tag">News</div>
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
  padding: $size-spacing--large;
  font-size: $font-size--small;
}

.c-news__meta {
  margin-right: $size-spacing;
  flex: 0.3;
}

.c-news__title {
  flex: 1;

  &:hover {
    text-decoration: underline;
  }
}

.c-news__item {
  margin-bottom: $size-spacing;
}

.c-news__published {
  color: $colour-text-secondary;
  flex: 0.2;
}

.c-news__tag {
  font-size: $font-size--x-small;
  font-weight: $font-weight--large;

  padding: 3px 6px;

  border-radius: 8px;
  background-color: $colour-primary;

  text-align: center;
}
</style>

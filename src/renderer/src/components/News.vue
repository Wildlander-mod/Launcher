<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    v-if="!failedToGetNews && news.length > 0"
    class="c-news l-column"
    data-testid="news-container"
  >
    <TransitionGroup name="c-news__group">
      <div
        v-for="newsItem in news"
        :key="newsItem.url"
        class="c-news__item"
        :data-testid="`news-item-${newsItem.title}`"
      >
        <BaseLink
          :href="`https://www.patreon.com${newsItem.url}`"
          class="l-row"
          data-testid="news-link"
        >
          <div
            class="c-news__published l-center-vertically"
            data-testid="news-date"
          >
            {{ new Date(newsItem.published).toLocaleDateString() }}
          </div>

          <div class="c-news__title" data-testid="news-title">
            {{ newsItem.title }}
          </div>
        </BaseLink>
      </div>
    </TransitionGroup>
  </div>
  <div
    v-if="failedToGetNews && news.length === 0"
    class="l-flex l-center"
    data-testid="news-error"
  >
    Unable to load latest news.
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseLink from "./BaseLink.vue";
import type { Post } from "../services/posts.service";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";

const newsService = injectStrict(SERVICE_BINDINGS.NEWS_SERVICE);

const news = ref<Post[]>([]);
const failedToGetNews = ref(false);

onMounted(async () => {
  try {
    news.value = await newsService.getPosts(updateNews);
  } catch {
    failedToGetNews.value = true;
  }
});

function updateNews(updatedNews: Post[]) {
  news.value = updatedNews;
}
</script>

<style lang="scss" scoped>
@import "@/renderer/src/assets/scss/index";

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
  color: $colour-text--secondary;

  flex: 0.3;
}

.c-news__group-enter-active,
.c-news__group-leave-active {
  transition: all 0.5s ease;
}

.c-news__group-enter-from,
.c-news__group-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>

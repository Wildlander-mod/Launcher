<template>
  <Page>
    <PageContent title="News" height="small">
      <NewsBox />
    </PageContent>

    <PageContent title="Patron Highlight">
      <PatronBox />
    </PageContent>
  </Page>
</template>

<script>
import NewsBox from "@/components/NewsBox.vue";
import PatronBox from "@/components/PatronBox.vue";
import PageContent from "@/components/PageContent";
import Page from "@/components/Page";

export default {
  name: "Home",
  components: {
    NewsBox,
    PatronBox,
    PageContent,
    Page
  }
};
</script>

<style lang="scss" scoped></style>

<template>
  <Page>
    <PageContent title="News" height="small">
      <NewsBox />
    </PageContent>

    <PageContent title="Patron Highlight">
      <Patrons />
    </PageContent>
  </Page>
</template>

<script>
import NewsBox from "@/components/NewsBox.vue";
import Patrons from "@/components/Patrons.vue";
import PageContent from "@/components/PageContent";
import Page from "@/components/Page";

export default {
  name: "Home",
  components: {
    NewsBox,
    Patrons,
    PageContent,
    Page
  }
};
</script>

<style lang="scss" scoped></style>

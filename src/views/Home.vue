<template>
  <Page>
    <PageContent title="News" height="small" width="small">
      <News />
    </PageContent>

    <PageContent title="Patron Highlight" width="small">
      <Patrons />
    </PageContent>
  </Page>
</template>

<script>
import News from "@/components/News.vue";
import Patrons from "@/components/Patrons.vue";
import PageContent from "@/components/PageContent";
import Page from "@/components/Page";

export default {
  name: "Home",
  components: {
    News,
    Patrons,
    PageContent,
    Page
  }
};
</script>

<style lang="scss" scoped></style>

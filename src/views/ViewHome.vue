<template>
  <AppPage layout="row">
    <AppPageContent title="News" :spacing="false" :center="true">
      <News />
    </AppPageContent>

    <AppPageContent title="Patron Highlight" :spacing="false" :center="true">
      <Patrons />
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import News from "@/components/News.vue";
import Patrons from "@/components/Patrons.vue";

@Options({
  components: { Patrons, News, AppPageContent, AppPage },
})
export default class ViewHome extends Vue {}
</script>

<style lang="scss" scoped></style>

<template>
  <AppPage>
    <AppPageContent title="Resources">
      <Resources />
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import Resources from "@/components/Resources.vue";

@Options({
  components: { Resources, AppPageContent, AppPage },
})
export default class ViewResources extends Vue {}
</script>

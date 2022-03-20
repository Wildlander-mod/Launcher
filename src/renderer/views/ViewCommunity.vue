<template>
  <AppPage>
    <AppPageContent>
      <Community />
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/renderer/components/AppPage.vue";
import AppPageContent from "@/renderer/components/AppPageContent.vue";
import Community from "@/renderer/components/Community.vue";

@Options({
  components: { Community, AppPageContent, AppPage },
})
export default class ViewCommunity extends Vue {}
</script>

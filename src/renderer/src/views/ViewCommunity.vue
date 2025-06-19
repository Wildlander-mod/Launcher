<template>
  <AppPageContent data-testid="page-community">
    <Community />
  </AppPageContent>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "../components/AppPage.vue";
import AppPageContent from "../components/AppPageContent.vue";
import Community from "../components/Community.vue";

@Options({
  components: { Community, AppPageContent, AppPage },
})
export default class ViewCommunity extends Vue {}
</script>

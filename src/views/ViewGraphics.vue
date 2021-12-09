<template>
  <AppPage>
    <AppPageContent>
      <ENB />
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import ENB from "@/components/ENB.vue";

@Options({
  components: { ENB, AppPageContent, AppPage },
})
export default class ViewGraphics extends Vue {}
</script>

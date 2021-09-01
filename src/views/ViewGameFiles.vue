<template>
  <AppPage>
    <AppPageContent title="Game files">
      <GameFiles />
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import GameFolderFiles from "@/components/GameFolderFiles.vue";

@Options({
  components: { GameFiles: GameFolderFiles, AppPageContent, AppPage },
})
export default class ViewGameFiles extends Vue {}
</script>

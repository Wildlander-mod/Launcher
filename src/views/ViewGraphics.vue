<template>
  <AppPage>
    <AppPageContent title="Graphics settings">
      <div class="l-column">
        <ENB class="c-graphics__enb" />
        <Resolution />
      </div>
    </AppPageContent>
  </AppPage>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppPage from "@/components/AppPage.vue";
import AppPageContent from "@/components/AppPageContent.vue";
import ENB from "@/components/ENB.vue";
import Resolution from "@/components/Resolution.vue";

@Options({
  components: { Resolution, ENB, AppPageContent, AppPage },
})
export default class ViewGraphics extends Vue {}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-graphics__enb {
  border-bottom: 1px solid $colour-background--light;
  margin-bottom: $size-spacing;
  padding-bottom: $size-spacing;
}
</style>

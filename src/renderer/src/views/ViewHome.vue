<template>
  <div data-testid="page-home" class="l-row">
    <AppPageContent :spacing="false" :scrollable="true">
      <News />
    </AppPageContent>

    <AppPageContent
      title="Patron Highlight"
      :spacing="false"
      :scrollable="true"
    >
      <Patrons />
    </AppPageContent>
  </div>
</template>

<script setup lang="ts">
import AppPageContent from "../components/AppPageContent.vue";
import News from "../components/News.vue";
import Patrons from "../components/Patrons.vue";
</script>

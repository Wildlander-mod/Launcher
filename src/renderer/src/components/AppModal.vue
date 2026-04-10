<template>
  <vue-final-modal
    v-model="model"
    :name="name"
    classes="l-flex l-center"
    content-class="c-modal l-flex"
    overlay-class="c-modal__overlay"
    :fit-parent="true"
    :click-to-close="false"
    :esc-to-close="false"
    :prevent-click="true"
    :lock-scroll="false"
  >
    <div class="l-column">
      <slot />

      <div
        v-if="includeCloseButton"
        class="c-modal__actions c-modal__actions--right"
        data-testid="modal-close-button-container"
      >
        <BaseButton v-if="includeCloseButton" @click="toggleModal(false)"
          >Close
        </BaseButton>
      </div>

      <div
        v-if="$slots.action"
        class="c-modal__actions u-spacing"
        data-testid="modal-action-slot-container"
      >
        <slot name="action"></slot>
      </div>
    </div>
  </vue-final-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject } from "vue";
import type { VueFinalModalProperty } from "vue-final-modal";
import { $vfm as moduleLevelVfm } from "vue-final-modal";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import BaseButton from "./BaseButton.vue";

// vue-final-modal v3 provides $vfm via app.provide('$vfm', ...) so inject() works
// in both production and tests (using global.provide in test utils).
const $vfm = inject<VueFinalModalProperty>("$vfm", moduleLevelVfm);

const props = withDefaults(
  defineProps<{
    name: string;
    showModal?: boolean;
    includeCloseButton?: boolean;
  }>(),
  {
    showModal: true,
    includeCloseButton: false,
  }
);

const model = ref(false);

const modalService = injectStrict(SERVICE_BINDINGS.MODAL_SERVICE);

onMounted(() => {
  toggleModal(props.showModal);
});

watch(
  () => props.showModal,
  (showModal) => {
    toggleModal(showModal);
  }
);

function toggleModal(showModal: boolean) {
  if (showModal) {
    modalService.openModal(props.name, $vfm);
  } else {
    modalService.closeModal(props.name, $vfm);
  }
}
</script>

<style lang="scss">
@use "../assets/scss/index" as *;

.c-modal {
  display: flex;
  align-content: center;
  justify-content: center;

  padding: $size-spacing--large;
  margin: $size-spacing--x-large;

  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--dark;
  backdrop-filter: $background-blur;
}

.c-modal__actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: $size-spacing;

  &--right {
    justify-content: flex-end;
  }
}

.c-modal__overlay {
  background-color: $colour-background-secondary--transparent;
  border: 1px solid $colour-background--dark;
  backdrop-filter: $background-blur;
}
</style>

<template>
  <vue-final-modal
    :name="name"
    v-model="model"
    classes="l-column l-center"
    content-class="c-modal"
    overlay-class="c-modal__overlay"
    :fit-parent="true"
    :click-to-close="false"
    :esc-to-close="false"
    :prevent-click="true"
  >
    <div class="l-column">
      <slot />

      <div class="c-modal__actions c-modal__actions--right">
        <Button @click="toggleModal(false)" v-if="includeCloseButton"
          >Close
        </Button>
      </div>
    </div>
  </vue-final-modal>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { injectStrict, SERVICE_BINDINGS } from "@/services/service-container";
import { ModalService } from "@/services/modal.service";
import Button from "@/components/controls/Button.vue";

@Options({
  components: {
    Button
  }
})
export default class Modal extends Vue {
  @Prop({ required: true }) showModal!: boolean;
  @Prop({ required: true }) name!: string;
  @Prop() includeCloseButton = false;
  private model = false;

  modalService!: ModalService;

  created() {
    this.modalService = injectStrict(SERVICE_BINDINGS.MODAL_SERVICE);
  }

  mounted() {
    this.toggleModal(this.showModal);
  }

  @Watch("showModal")
  toggleModal(showModal: boolean) {
    if (showModal) {
      this.modalService.openModal(this.name, this.$vfm);
    } else {
      this.modalService.closeModal(this.name, this.$vfm);
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss";

.c-modal {
  display: flex;
  align-content: center;
  justify-content: center;

  width: $size-window-width/2;

  padding: $size-spacing--large;

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

<template>
  <Popper
    :arrow="true"
    :interactive="false"
    placement="right"
    :show="showTooltip && isOpen"
  >
    <template #content>
      <slot />
    </template>

    <div
      class="c-select"
      :class="{
        'c-select--fixed-width': !grow,
        'c-select--open': isOpen && !loading,
        'c-select--closed': !isOpen && !loading,
      }"
      v-click-away="() => toggleOpenState(false)"
    >
      <div
        class="c-select__head u-text"
        :class="{
          'c-select__head--open': isOpen && !loading,
          'c-select__head--closed': !isOpen && !loading,
        }"
        @click="() => toggleOpenState()"
      >
        {{ selectedOption.text }}
        <span
          class="material-icons c-select__icon"
          :class="{
            'c-select__icon--open': isOpen && !loading,
            'c-select__icon--closed': !isOpen && !loading,
          }"
        >
          expand_more
        </span>
      </div>
      <div
        class="c-select__options u-scroll-y-auto"
        :class="{
          'c-select__options--open': isOpen && !loading,
          'c-select__options--closed': !isOpen && !loading,
          'c-select__options--loading': loading,
        }"
      >
        <div
          v-for="option in options"
          :key="option.value"
          class="c-select__option"
          :class="{
            'c-select__option--disabled': option.disabled,
          }"
          @click="!option.disabled && select(option)"
        >
          <div class="u-text">{{ option.text }}</div>
        </div>
      </div>
    </div>
  </Popper>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import Popper from "vue3-popper";

export interface SelectOption {
  text: string;
  value: unknown;
  disabled?: boolean;
}

@Component({
  components: { Popper },
})
export default class BaseDropdown extends Vue {
  @Prop({ required: true }) options!: SelectOption[];
  @Prop({ required: false }) onOptionSelected!: (option: SelectOption) => void;
  @Prop({ required: true }) currentSelection!: SelectOption;
  @Prop({ default: false }) grow!: boolean;
  @Prop({ default: false }) showTooltip!: boolean;

  selectedOption!: SelectOption;
  isOpen = false;
  loading = true;

  created() {
    this.selectedOption = this.currentSelection;
  }

  select(option: SelectOption) {
    this.selectedOption = option;
    this.isOpen = false;
    if (this.onOptionSelected) {
      this.onOptionSelected(option);
    }
  }

  toggleOpenState(open?: boolean) {
    this.isOpen = open !== undefined ? open : !this.isOpen;
    // To prevent the closing class from playing the animation on load, a loading class is used to hide the options.
    // Once the dialog has been opened, it can be removed.
    if (this.isOpen) {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

$selectFocus: rgba(255, 255, 255, 0.1);

.c-select {
  height: 30px;
  user-select: none;
  border-radius: 2px;

  background-color: $colour-background--light;

  &--fixed-width {
    width: 155px;
  }

  &:hover {
    cursor: pointer;
    background-color: $colour-background--dark;
  }

  &--open {
    background-color: $colour-background--dark;
  }
}

.c-select--loading {
  display: none;
}

.c-select__head {
  display: flex;
  justify-content: space-between;
  height: $size-action-height;
  width: 100%;
  overflow: hidden;
  margin-bottom: 0;
  padding-left: 8px;

  .c-select__icon {
    align-self: center;

    &--closed {
      animation: rotate-reverse 0.2s linear forwards;

      @keyframes rotate-reverse {
        from {
          transform: rotate(-180deg);
        }
        to {
          transform: rotate(0deg);
        }
      }
    }

    &--open {
      animation: rotate 0.2s linear forwards;

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-180deg);
        }
      }
    }
  }
}

.c-select__options {
  background-color: $colour-background--light-solid;
  position: absolute;
  transform-origin: top;
  width: 200px;
  z-index: 1;
  border-radius: 0 4px 4px 4px;
  max-height: 200px;
  padding-left: 8px;

  &--closed {
    animation: retract 0.2s forwards;
  }

  &--open {
    animation: expand 0.2s forwards;
  }

  &--loading {
    display: none;
  }

  @keyframes expand {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(1);
    }
  }

  @keyframes retract {
    from {
      transform: scaleY(1);
    }
    to {
      transform: scaleY(0);
    }
  }
}

.c-select__option {
  cursor: default;

  &--disabled {
    background-color: $colour-background--dark;
    color: $colour-text--secondary;
  }

  &:not(&--disabled):hover {
    background-color: $selectFocus;
    cursor: pointer;
  }
}

:deep(.popper) {
  background-color: $colour-background--darker-solid;
  padding: $size-spacing;
}

:deep(.popper #arrow::before) {
  background-color: $colour-background--darker-solid;
}

:deep(.popper:hover),
:deep(.popper:hover > #arrow::before) {
  background-color: $colour-background--darker-solid;
}
</style>

<template>
  <div
    v-if="!loadingData"
    :class="[
      'c-select',
      `${isOpen === true ? 'c-select--open' : 'c-select--closed'}`
    ]"
  >
    <div
      :class="[
        'c-select__head',
        'u-text',
        `${isOpen === true ? 'c-select__head--open' : 'c-select__head--closed'}`
      ]"
      @click="toggleOpenState"
    >
      {{ selectedOption.text }}
      <span
        :class="[
          'material-icons',
          'c-select__icon',
          `${
            isOpen === true ? 'c-select__icon--open' : 'c-select__icon--closed'
          }`
        ]"
      >
        expand_more
      </span>
    </div>
    <div
      :class="[
        'c-select__options',
        `${
          isOpen === true
            ? 'c-select__options--open'
            : 'c-select__options--closed'
        }`
      ]"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="c-select__option"
        @click="select(option)"
      >
        <div class="u-text">{{ option.text }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options as Component, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

export interface SelectOption {
  text: string;
  value: string;
}

@Component({})
export default class Select extends Vue {
  @Prop({ required: true }) options!: SelectOption[];
  @Prop({ required: false }) onOptionSelected!: (option: SelectOption) => void;
  @Prop({ required: true }) initialSelection!: SelectOption;
  @Prop() loadingData = false;

  selectedOption!: SelectOption;
  isOpen = false;

  created() {
    this.selectedOption = this.initialSelection;
  }

  @Watch("initialSelection")
  select(option: SelectOption) {
    this.selectedOption = option;
    this.isOpen = false;
    if (this.onOptionSelected) {
      this.onOptionSelected(option);
    }
  }

  toggleOpenState() {
    this.isOpen = !this.isOpen;
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

  &:hover {
    cursor: pointer;
    background-color: $colour-background--dark;
  }

  &--open {
    background-color: $colour-background--dark;
  }
}

.c-select__head {
  display: flex;
  justify-content: space-between;
  width: 155px;
  height: $size-action-height;
  overflow: hidden;
  margin-bottom: 0;

  .c-select__icon {
    align-self: center;

    &--closed {
      animation: rotate-reverse 0.2s linear forwards;

      @keyframes rotate-reverse {
        from {
          transform: rotate(180deg);
        }
        to {
          transform: rotate(360deg);
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
          transform: rotate(180deg);
        }
      }
    }
  }
}

.c-select__options {
  background-color: $colour-background--light-solid;
  padding-bottom: 8px;
  padding-top: -8px;
  position: absolute;
  transform-origin: top;
  width: 200px;
  z-index: 1;
  border-radius: 0 4px 4px 4px;
  max-height: $size-window-height/2;
  overflow-y: scroll;

  &--closed {
    animation: retract 0.2s forwards;
  }

  &--open {
    animation: expand 0.2s forwards;
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

.c-select__option:hover {
  background-color: $selectFocus;
  cursor: pointer;
}

// TODO this should be globally applied as a default
.u-text {
  padding-left: 8px;
  font-weight: 300;
  line-height: 30px;
  size: 14px;
  box-sizing: border-box;
}
</style>

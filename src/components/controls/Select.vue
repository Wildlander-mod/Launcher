<template>
  <div :class="`c-select c-select${isOpenModifier}`">
    <div
      :class="`c-select__head u-text c-select__head${isOpenModifier}`"
      @click="toggle"
    >
      {{ currentOption.name }}
      <span
        :class="
          'material-icons ' + `c-select__icon c-select__icon${isOpenModifier}`
        "
      >
        expand_more
      </span>
    </div>
    <div :class="`c-select__options c-select__options${isOpenModifier}`">
      <div
        v-for="option in options"
        :key="option.name"
        class="c-select__option"
        @click="select(option)"
      >
        <div class="u-text">{{ option.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Select",
  props: {
    options: Array,
    placeholder: String
  },
  data() {
    return {
      currentOption: this.options
        ? this.options[0]
        : { name: this.placeholder },
      isOpenModifier: "--closed"
    };
  },
  methods: {
    select(option) {
      this.currentOption = option;
      this.isOpenModifier = "--closed";
    },
    toggle() {
      if (this.options) {
        if (this.isOpenModifier === "--closed") {
          this.isOpenModifier = "--open";
        } else {
          this.isOpenModifier = "--closed";
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss";

$selectBackground: #767676;
$selectFocus: rgba(255, 255, 255, 0.1);

.c-select {
  height: 30px;
  user-select: none;
  border-radius: 2px;

  background-color: $selectBackground;
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
  background-color: $selectBackground;
  padding-bottom: 8px;
  padding-top: 8px;
  position: absolute;
  transform-origin: top;
  width: 200px;
  z-index: 1;
  border-radius: 0 4px 4px 4px;

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

<template>
  <div id="select">
    <div @click="toggle" id="select__head">
      <p>
        {{ currentOption.name }}
      </p>
      <span :class="'material-icons ' + `select__icon${isOpenModifier}`">
        expand_more
      </span>
    </div>
    <div :class="`select__options${isOpenModifier}`" id="select__options">
      <div @click="select(option)" :key="option.name" v-for="option in options">
        <p>
          {{ option.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Select",
  props: {
    options: Array,
    placeholder: String,
  },
  data() {
    return {
      currentOption: this.options
        ? this.options[0]
        : { name: this.placeholder },
      isOpenModifier: "--closed",
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
    },
  },
};
</script>

<style lang="scss" scoped>
div {
  height: 30px;
  user-select: none;

  &#select__head {
    background-color: #e1e1e133;
    border-radius: 2px;
    display: flex;
    justify-content: space-between;
    width: 155px;

    &:active {
      background-color: #767676;
    }

    &:hover {
      cursor: pointer;
    }

    span {
      align-self: center;
      display: inline-block;

      &.select__icon--closed {
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

      &.select__icon--open {
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

  &#select__options {
    background-color: #767676;
    height: auto;
    padding-bottom: 8px;
    padding-top: 8px;
    position: absolute;
    transform-origin: top;
    width: 200px;
    z-index: 1;

    &.select__options--closed {
      animation: retract 0.2s forwards;
    }

    &.select__options--open {
      animation: expand 0.2s forwards;
    }

    div:hover {
      background-color: #ffffff1a;
      cursor: pointer;
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
}

p {
  margin-left: 8px;
}
</style>

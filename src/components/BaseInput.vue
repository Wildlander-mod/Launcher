<template>
  <div class="l-column">
    <label
      class="c-input__label"
      :class="{ 'c-input__label--centered': centered }"
    >
      {{ label }}
    </label>
    <input
      type="text"
      :readonly="readonly"
      class="c-input"
      @input="input"
      @click="click"
      :value="value"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Emit, Prop } from "vue-property-decorator";

@Options({
  emits: ["input", "click"],
})
export default class BaseInput extends Vue {
  @Prop({ required: true }) private label!: string;
  @Prop({ default: false }) private readonly!: boolean;
  @Prop({ default: false }) private centered!: boolean;
  @Prop() private value!: string;

  @Emit()
  input(event: Event) {
    return event.target as HTMLInputElement;
  }

  @Emit()
  click(event: Event) {
    return event.target as HTMLInputElement;
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-input {
  height: $size-action-height;
  padding: $size-spacing;

  margin-right: $size-spacing;

  box-sizing: border-box;
  color: #ffffff;
  background: $colour-background--light;
  border: none;
  border-radius: 2px;
}

.c-input__label {
  font-size: $font-size--body;
  line-height: $line-height__body;

  margin-bottom: $size-spacing;
}

.c-input__label--centered {
  display: flex;
  justify-content: center;
  text-align: center;
}
</style>

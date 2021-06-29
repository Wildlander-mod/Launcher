<template>
  <div class="l-column">
    <label class="c-input__label">
      {{ label }}
    </label>
    <input type="text" class="c-input" :oninput="handleInput" :value="value" />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class Input extends Vue {
  @Prop() private oninput!: (filepath: string) => void;
  @Prop() private value!: string;
  @Prop({ required: true }) private label!: string;

  handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.oninput) {
      this.oninput(target.value);
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-input {
  width: 300px;
  height: $size-height;
  padding: $size-spacing;

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
</style>

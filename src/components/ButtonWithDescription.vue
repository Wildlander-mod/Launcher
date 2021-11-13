<template>
  <div class="c-button-with-description">
    <div class="c-button-with-description__text l-flex">{{ description }}</div>
    <div class="l-flex">
      <BaseButton :type="buttonType" @click="action"
        >{{ buttonText }}
      </BaseButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import BaseButton, { ButtonTypes } from "@/components/BaseButton.vue";

@Options({
  components: {
    BaseButton,
  },
})
export default class ButtonWithDescription extends Vue {
  @Prop({ required: true })
  action!: () => void;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  buttonText!: string;

  @Prop({ default: "default" })
  buttonType!: ButtonTypes;
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-button-with-description {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: $size-spacing;

  width: 40%;
}

.c-button-with-description__text {
  margin-right: $size-spacing;
}
</style>

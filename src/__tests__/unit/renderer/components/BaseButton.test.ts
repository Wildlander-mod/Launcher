import { mount } from "@vue/test-utils";
import BaseButton from "../../../../renderer/src/components/BaseButton.vue";

describe("BaseButton Component #renderer #component", () => {
  describe("Props", () => {
    describe("size prop", () => {
      it("should apply small size by default", () => {
        const wrapper = mount(BaseButton, { shallow: true });
        expect(wrapper.classes()).toContain("c-button--small");
      });

      it("should apply large size class when size is large", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { size: "large" },
        });
        expect(wrapper.classes()).toContain("c-button--large");
      });

      it("should apply small size class when size is small", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { size: "small" },
        });
        expect(wrapper.classes()).toContain("c-button--small");
      });

      it("should apply grow size class when size is grow", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { size: "grow" },
        });
        expect(wrapper.classes()).toContain("c-button--grow");
      });
    });

    describe("type prop", () => {
      it("should apply default type by default", () => {
        const wrapper = mount(BaseButton, { shallow: true });
        expect(wrapper.classes()).toContain("c-button--default");
      });

      it("should apply primary type class when type is primary", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { type: "primary" },
        });
        expect(wrapper.classes()).toContain("c-button--primary");
      });

      it("should apply default type class when type is default", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { type: "default" },
        });
        expect(wrapper.classes()).toContain("c-button--default");
      });

      it("should apply warning type class when type is warning", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { type: "warning" },
        });
        expect(wrapper.classes()).toContain("c-button--warning");
      });
    });

    describe("disabled prop", () => {
      it("should not be disabled by default", () => {
        const wrapper = mount(BaseButton, { shallow: true });
        expect(wrapper.classes()).not.toContain("c-button--disabled");
      });

      it("should apply disabled class when disabled is true", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { disabled: true },
        });
        expect(wrapper.classes()).toContain("c-button--disabled");
      });

      it("should not apply disabled class when disabled is false", () => {
        const wrapper = mount(BaseButton, {
          shallow: true,
          props: { disabled: false },
        });
        expect(wrapper.classes()).not.toContain("c-button--disabled");
      });
    });
  });
});

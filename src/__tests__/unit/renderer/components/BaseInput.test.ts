import { mount } from "@vue/test-utils";
import BaseInput from "@/renderer/src/components/BaseInput.vue";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

const selectors = {
  input: byTestId("base-input"),
};

describe("BaseInput Component #renderer #component", () => {
  describe("User Interaction", () => {
    it("should emit input event when user types", async () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test" },
      });

      await wrapper.find(selectors.input).trigger("input");

      expect(wrapper.emitted("input")).toBeTruthy();
    });

    it("should emit click event when user clicks input", async () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test" },
      });

      await wrapper.find(selectors.input).trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });

  describe("Label Display", () => {
    it("should display label text", () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test Label" },
      });

      expect(wrapper.findComponent({ name: "BaseLabel" }).props("label")).toBe(
        "Test Label"
      );
    });
  });

  describe("Label Centering", () => {
    it("should center label when centered prop is true", () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test", centered: true },
      });

      expect(
        wrapper.findComponent({ name: "BaseLabel" }).props("centered")
      ).toBe(true);
    });

    it("should not center label by default", () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test" },
      });

      expect(
        wrapper.findComponent({ name: "BaseLabel" }).props("centered")
      ).toBe(false);
    });
  });

  describe("Value Display", () => {
    it("should display value in input field", async () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test", value: "Test Value" },
      });

      await wrapper.vm.$nextTick();

      expect(
        wrapper.find<HTMLInputElement>(selectors.input).element.value
      ).toBe("Test Value");
    });
  });

  describe("Readonly State", () => {
    it("should make input readonly when readonly prop is true", async () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test", readonly: true },
      });

      expect(
        wrapper.find(selectors.input).attributes("readonly")
      ).toBeDefined();
    });

    it("should allow editing by default", async () => {
      const wrapper = mount(BaseInput, {
        shallow: true,
        props: { label: "Test" },
      });

      await wrapper.vm.$nextTick();

      expect(
        wrapper.find(selectors.input).attributes("readonly")
      ).toBeUndefined();
    });
  });
});

import { mount } from "@vue/test-utils";
import BaseLabel from "../../../../renderer/src/components/BaseLabel.vue";
import { byTestId } from "../utils/test-utils";

const selectors = {
  label: byTestId("input-label"),
};

describe("BaseLabel", () => {
  it("should render the label text", () => {
    const wrapper = mount(BaseLabel, {
      shallow: true,
      props: {
        label: "Test Label",
      },
    });

    expect(wrapper.find(selectors.label).text()).toBe("Test Label");
  });

  it("should apply centered class when centered prop is true", () => {
    const wrapper = mount(BaseLabel, {
      shallow: true,
      props: {
        label: "Test Label",
        centered: true,
      },
    });

    expect(wrapper.find(selectors.label).classes()).toContain(
      "c-label--centered"
    );
  });

  it("should not apply centered class when centered prop is false", () => {
    const wrapper = mount(BaseLabel, {
      shallow: true,
      props: {
        label: "Test Label",
        centered: false,
      },
    });

    expect(wrapper.find(selectors.label).classes()).not.toContain(
      "c-label--centered"
    );
  });
});

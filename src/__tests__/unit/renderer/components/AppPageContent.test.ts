import { mount } from "@vue/test-utils";
import AppPageContent from "@/renderer/src/components/AppPageContent.vue";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

const selectors = {
  slotContent: byTestId("slot-content"),
  body: byTestId("page-content-body"),
};

describe("AppPageContent", () => {
  it("should render default slot content", () => {
    const wrapper = mount(AppPageContent, {
      shallow: true,
      slots: {
        default: "<div data-testid='slot-content'>Test Content</div>",
      },
    });

    expect(wrapper.find(selectors.slotContent).exists()).toBe(true);
  });

  it("should apply large spacing class when spacing prop is true", () => {
    const wrapper = mount(AppPageContent, {
      shallow: true,
      props: {
        spacing: true,
      },
    });

    expect(wrapper.find(selectors.body).classes()).toContain(
      "c-page-content__body--large-spacing"
    );
  });

  it("should not apply large spacing class when spacing prop is false", () => {
    const wrapper = mount(AppPageContent, {
      shallow: true,
      props: {
        spacing: false,
      },
    });

    expect(wrapper.find(selectors.body).classes()).not.toContain(
      "c-page-content__body--large-spacing"
    );
  });

  it("should apply scrollable class when scrollable prop is true", () => {
    const wrapper = mount(AppPageContent, {
      shallow: true,
      props: {
        scrollable: true,
      },
    });

    expect(wrapper.find(selectors.body).classes()).toContain("u-scroll-y-auto");
  });

  it("should not apply scrollable class when scrollable prop is false", () => {
    const wrapper = mount(AppPageContent, {
      shallow: true,
      props: {
        scrollable: false,
      },
    });

    expect(wrapper.find(selectors.body).classes()).not.toContain(
      "u-scroll-y-auto"
    );
  });
});

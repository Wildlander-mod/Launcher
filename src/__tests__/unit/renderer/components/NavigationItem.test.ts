import { mount } from "@vue/test-utils";
import NavigationItem from "../../../../renderer/src/components/NavigationItem.vue";
import { byTestId } from "../utils/test-utils";

const selectors = {
  navigationItem: byTestId("navigation-item"),
};

describe("NavigationItem", () => {
  it("should apply active class when active prop is true", () => {
    const wrapper = mount(NavigationItem, {
      shallow: true,
      props: { active: true },
      global: { renderStubDefaultSlot: true },
    });

    expect(wrapper.find(selectors.navigationItem).classes()).toContain(
      "c-nav-link--active"
    );
  });

  it("should not apply active class when active prop is false", () => {
    const wrapper = mount(NavigationItem, {
      shallow: true,
      props: { active: false },
      global: { renderStubDefaultSlot: true },
    });

    expect(wrapper.find(selectors.navigationItem).classes()).not.toContain(
      "c-nav-link--active"
    );
  });

  it("should render slot content", () => {
    const wrapper = mount(NavigationItem, {
      shallow: true,
      props: { active: false },
      slots: { default: "Home" },
      global: { renderStubDefaultSlot: true },
    });

    expect(wrapper.find(selectors.navigationItem).text()).toBe("Home");
  });
});

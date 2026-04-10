import { mount } from "@vue/test-utils";
import ViewHome from "../../../../renderer/src/views/ViewHome.vue";
import { byTestId } from "../utils/test-utils";

const selectors = {
  page: byTestId("page-home"),
};

describe("ViewHome #renderer #view", () => {
  const createWrapper = () =>
    mount(ViewHome, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  it("should render the page container", () => {
    const wrapper = createWrapper();

    expect(wrapper.find(selectors.page).exists()).toBe(true);
  });

  it("should render the News component", () => {
    const wrapper = createWrapper();

    expect(wrapper.findComponent({ name: "News" }).exists()).toBe(true);
  });

  it("should render the Patrons component", () => {
    const wrapper = createWrapper();

    expect(wrapper.findComponent({ name: "Patrons" }).exists()).toBe(true);
  });
});

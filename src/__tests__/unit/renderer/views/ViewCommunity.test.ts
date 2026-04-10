import { mount } from "@vue/test-utils";
import ViewCommunity from "../../../../renderer/src/views/ViewCommunity.vue";
import { byTestId } from "../utils/test-utils";

const selectors = {
  page: byTestId("page-community"),
};

describe("ViewCommunity #renderer #view", () => {
  const createWrapper = () =>
    mount(ViewCommunity, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  it("should render the page container", () => {
    const wrapper = createWrapper();

    expect(wrapper.find(selectors.page).exists()).toBe(true);
  });

  it("should render the Community component", () => {
    const wrapper = createWrapper();

    expect(wrapper.findComponent({ name: "Community" }).exists()).toBe(true);
  });
});

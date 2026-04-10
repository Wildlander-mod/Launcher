import { mount } from "@vue/test-utils";
import BaseList from "../../../../renderer/src/components/BaseList.vue";
import { byTestId } from "../utils/test-utils";

const selectors = {
  title: byTestId("list-title"),
  listContent: byTestId("list-content"),
  listItems: `${byTestId("list-content")} li`,
};

describe("BaseList", () => {
  it("should render the title slot content", () => {
    const wrapper = mount(BaseList, {
      shallow: true,
      props: { items: [] },
      slots: { default: "Test Title" },
    });

    expect(wrapper.find(selectors.title).text()).toBe("Test Title");
  });

  it("should render all items in the list", () => {
    const items = ["Item 1", "Item 2", "Item 3"];
    const wrapper = mount(BaseList, {
      shallow: true,
      props: { items },
    });

    const listItems = wrapper.findAll(selectors.listItems);
    expect(listItems).toHaveLength(3);
  });

  it("should render item text correctly", () => {
    const items = ["First Item"];
    const wrapper = mount(BaseList, {
      shallow: true,
      props: { items },
    });

    expect(wrapper.find(selectors.listItems).text()).toBe("First Item");
  });

  it("should render empty list when items array is empty", () => {
    const wrapper = mount(BaseList, {
      shallow: true,
      props: { items: [] },
    });

    const listItems = wrapper.findAll(selectors.listItems);
    expect(listItems).toHaveLength(0);
  });

  it("should render multiple items with correct text", () => {
    const items = ["Alpha", "Beta", "Gamma"];
    const wrapper = mount(BaseList, {
      shallow: true,
      props: { items },
    });

    const listItems = wrapper.findAll(selectors.listItems);
    expect(listItems[0]?.text()).toBe("Alpha");
    expect(listItems[1]?.text()).toBe("Beta");
    expect(listItems[2]?.text()).toBe("Gamma");
  });
});

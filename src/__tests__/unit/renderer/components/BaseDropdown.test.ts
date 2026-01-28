import { mount } from "@vue/test-utils";
import BaseDropdown from "@/renderer/src/components/BaseDropdown.vue";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

interface SelectOption {
  text: string;
  value: unknown;
  disabled?: boolean;
  hidden?: boolean;
}

// Mock Popper component
const MockPopper = {
  name: "Popper",
  template: "<div><slot name='content' /><slot /></div>",
};

// Selectors
const selectors = {
  dropdown: byTestId("dropdown-head"),
  options: byTestId("dropdown-options"),
  option: (index: number) => byTestId(`dropdown-option-${index}`),
  disabledOption: (index: number) =>
    byTestId(`dropdown-option-disabled-${index}`),
};

describe("BaseDropdown #renderer #component", () => {
  const defaultOptions: SelectOption[] = [
    { text: "Option 1", value: 1 },
    { text: "Option 2", value: 2 },
    { text: "Option 3", value: 3 },
  ];

  const defaultSelection = defaultOptions[0];

  describe("Opening and Closing Dropdown", () => {
    let wrapper: ReturnType<typeof mount>;
    let clickAwayHandler: (() => void) | undefined;

    beforeEach(() => {
      wrapper = mount(BaseDropdown, {
        shallow: true,
        props: {
          options: defaultOptions,
          currentSelection: defaultSelection,
        },
        global: {
          stubs: {
            Popper: MockPopper,
          },
          directives: {
            "click-away": {
              mounted(_el: HTMLElement, binding: { value: () => void }) {
                clickAwayHandler = binding.value;
              },
            },
          },
          renderStubDefaultSlot: true,
        },
      });
    });

    it("should open dropdown when clicking the head", async () => {
      await wrapper.find(selectors.dropdown).trigger("click");

      const optionsContainer = wrapper.find(selectors.options);
      expect(optionsContainer.classes()).toContain("c-select__options--open");
    });

    it("should close dropdown when clicking the head while open", async () => {
      const head = wrapper.find(selectors.dropdown);
      await head.trigger("click");
      await head.trigger("click");

      const optionsContainer = wrapper.find(selectors.options);
      expect(optionsContainer.classes()).toContain("c-select__options--closed");
    });

    it("should close dropdown when clicking outside", async () => {
      await wrapper.find(selectors.dropdown).trigger("click");

      clickAwayHandler?.();
      await wrapper.vm.$nextTick();

      const optionsContainer = wrapper.find(selectors.options);
      expect(optionsContainer.classes()).toContain("c-select__options--closed");
    });
  });

  describe("Selecting Options", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
      wrapper = mount(BaseDropdown, {
        shallow: true,
        props: {
          options: defaultOptions,
          currentSelection: defaultSelection,
        },
        global: {
          stubs: {
            Popper: MockPopper,
          },
          directives: {
            "click-away": {
              mounted() {},
            },
          },
          renderStubDefaultSlot: true,
        },
      });
    });

    it("should select option when clicking it", async () => {
      await wrapper.find(selectors.dropdown).trigger("click");
      await wrapper.find(selectors.option(1)).trigger("click");

      expect(wrapper.emitted("selected")).toBeTruthy();
      expect(wrapper.emitted("selected")?.[0]).toEqual([defaultOptions[1]]);
    });

    it("should close dropdown after selecting option", async () => {
      await wrapper.find(selectors.dropdown).trigger("click");
      await wrapper.find(selectors.option(0)).trigger("click");

      const optionsContainer = wrapper.find(selectors.options);
      expect(optionsContainer.classes()).toContain("c-select__options--closed");
    });

    it("should not select disabled options", async () => {
      const optionsWithDisabled: SelectOption[] = [
        { text: "Option 1", value: 1 },
        { text: "Option 2", value: 2, disabled: true },
      ];

      wrapper = mount(BaseDropdown, {
        shallow: true,
        props: {
          options: optionsWithDisabled,
          currentSelection: optionsWithDisabled[0],
        },
        global: {
          stubs: {
            Popper: MockPopper,
          },
          directives: {
            "click-away": {
              mounted() {},
            },
          },
          renderStubDefaultSlot: true,
        },
      });

      await wrapper.find(selectors.dropdown).trigger("click");
      await wrapper.find(selectors.disabledOption(1)).trigger("click");

      expect(wrapper.emitted("selected")).toBeFalsy();
    });

    it("should keep dropdown open when clicking disabled option", async () => {
      const optionsWithDisabled: SelectOption[] = [
        { text: "Option 1", value: 1 },
        { text: "Option 2", value: 2, disabled: true },
      ];

      wrapper = mount(BaseDropdown, {
        shallow: true,
        props: {
          options: optionsWithDisabled,
          currentSelection: optionsWithDisabled[0],
        },
        global: {
          stubs: {
            Popper: MockPopper,
          },
          directives: {
            "click-away": {
              mounted() {},
            },
          },
          renderStubDefaultSlot: true,
        },
      });

      await wrapper.find(selectors.dropdown).trigger("click");
      await wrapper.find(selectors.disabledOption(1)).trigger("click");

      const optionsContainer = wrapper.find(selectors.options);
      expect(optionsContainer.classes()).toContain("c-select__options--open");
    });

    it("should not display hidden options", () => {
      const optionsWithHidden: SelectOption[] = [
        { text: "Option 1", value: 1 },
        { text: "Option 2", value: 2, hidden: true },
        { text: "Option 3", value: 3 },
      ];

      wrapper = mount(BaseDropdown, {
        shallow: true,
        props: {
          options: optionsWithHidden,
          currentSelection: optionsWithHidden[0],
        },
        global: {
          stubs: {
            Popper: MockPopper,
          },
          directives: {
            "click-away": {
              mounted() {},
            },
          },
          renderStubDefaultSlot: true,
        },
      });

      expect(wrapper.find(selectors.option(0)).text()).toBe("Option 1");
      expect(wrapper.find(selectors.option(1)).text()).toBe("Option 3");
      expect(wrapper.find(selectors.option(2)).exists()).toBe(false);
    });
  });
});

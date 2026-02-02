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
  props: ["show", "hover", "arrow", "interactive", "placement"],
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

  const createWrapper = (
    overrides: {
      props?: Record<string, unknown>;
      slots?: Record<string, string>;
      clickAwayHandler?: (handler: () => void) => void;
    } = {}
  ) => {
    let clickAwayHandler: (() => void) | undefined;

    const wrapper = mount(BaseDropdown, {
      shallow: true,
      props: {
        options: defaultOptions,
        currentSelection: defaultSelection,
        ...overrides.props,
      },
      ...(overrides.slots && { slots: overrides.slots }),
      global: {
        stubs: {
          Popper: MockPopper,
        },
        directives: {
          "click-away": {
            mounted(_el: HTMLElement, binding: { value: () => void }) {
              clickAwayHandler = binding.value;
              overrides.clickAwayHandler?.(binding.value);
            },
          },
        },
        renderStubDefaultSlot: true,
      },
    });

    return { wrapper, clickAwayHandler };
  };

  describe("Opening and Closing Dropdown", () => {
    let wrapper: ReturnType<typeof mount>;
    let clickAwayHandler: (() => void) | undefined;

    beforeEach(() => {
      ({ wrapper, clickAwayHandler } = createWrapper());
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
      ({ wrapper } = createWrapper());
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

      ({ wrapper } = createWrapper({
        props: {
          options: optionsWithDisabled,
          currentSelection: optionsWithDisabled[0],
        },
      }));

      await wrapper.find(selectors.dropdown).trigger("click");
      await wrapper.find(selectors.disabledOption(1)).trigger("click");

      expect(wrapper.emitted("selected")).toBeFalsy();
    });

    it("should keep dropdown open when clicking disabled option", async () => {
      const optionsWithDisabled: SelectOption[] = [
        { text: "Option 1", value: 1 },
        { text: "Option 2", value: 2, disabled: true },
      ];

      ({ wrapper } = createWrapper({
        props: {
          options: optionsWithDisabled,
          currentSelection: optionsWithDisabled[0],
        },
      }));

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

      ({ wrapper } = createWrapper({
        props: {
          options: optionsWithHidden,
          currentSelection: optionsWithHidden[0],
        },
      }));

      expect(wrapper.find(selectors.option(0)).text()).toBe("Option 1");
      expect(wrapper.find(selectors.option(1)).text()).toBe("Option 3");
      expect(wrapper.find(selectors.option(2)).exists()).toBe(false);
    });
  });

  describe("Current Selection Display", () => {
    it("should display current selection text", () => {
      const { wrapper } = createWrapper();

      expect(wrapper.find(selectors.dropdown).text()).toContain("Option 1");
    });
  });

  describe("Size Variations", () => {
    it("should apply small styling when small prop is true", () => {
      const { wrapper } = createWrapper({ props: { small: true } });

      expect(wrapper.find(selectors.options).classes()).toContain(
        "c-select__options--small"
      );
    });

    it("should apply fixed width when grow prop is false", () => {
      const { wrapper } = createWrapper({ props: { grow: false } });

      expect(wrapper.find(".c-select").classes()).toContain(
        "c-select--fixed-width"
      );
    });

    it("should not apply fixed width when grow prop is true", () => {
      const { wrapper } = createWrapper({ props: { grow: true } });

      expect(wrapper.find(".c-select").classes()).not.toContain(
        "c-select--fixed-width"
      );
    });
  });

  describe("Options Rendering", () => {
    it("should render all visible options", () => {
      const { wrapper } = createWrapper();

      expect(wrapper.find(selectors.option(0)).exists()).toBe(true);
      expect(wrapper.find(selectors.option(1)).exists()).toBe(true);
      expect(wrapper.find(selectors.option(2)).exists()).toBe(true);
    });

    it("should show disabled styling for disabled options", () => {
      const optionsWithDisabled: SelectOption[] = [
        { text: "Option 1", value: 1 },
        { text: "Option 2", value: 2, disabled: true },
      ];

      const { wrapper } = createWrapper({
        props: {
          options: optionsWithDisabled,
          currentSelection: optionsWithDisabled[0],
        },
      });

      expect(wrapper.find(selectors.disabledOption(1)).classes()).toContain(
        "c-select__option--disabled"
      );
    });
  });

  describe("Tooltip Behavior", () => {
    it("should show tooltip when showTooltip is true and dropdown is open", async () => {
      const { wrapper } = createWrapper({ props: { showTooltip: true } });

      await wrapper.find(selectors.dropdown).trigger("click");

      expect(wrapper.findComponent(MockPopper).props("show")).toBe(true);
    });

    it("should hide tooltip when showTooltip is false", () => {
      const { wrapper } = createWrapper({ props: { showTooltip: false } });

      expect(wrapper.findComponent(MockPopper).props("show")).toBe(false);
    });

    it("should enable hover tooltip when showTooltipOnHover is true", () => {
      const { wrapper } = createWrapper({
        props: { showTooltipOnHover: true },
      });

      expect(wrapper.findComponent(MockPopper).props("hover")).toBe(true);
    });
  });

  describe("Loading State", () => {
    it("should hide options during initial loading", () => {
      const { wrapper } = createWrapper();

      expect(wrapper.find(selectors.options).classes()).toContain(
        "c-select__options--loading"
      );
    });

    it("should show options after first open", async () => {
      const { wrapper } = createWrapper();

      await wrapper.find(selectors.dropdown).trigger("click");

      expect(wrapper.find(selectors.options).classes()).not.toContain(
        "c-select__options--loading"
      );
    });
  });

  describe("Slot Content", () => {
    it("should render slot content in tooltip", () => {
      const slotContent = "<div class='tooltip-content'>Test Tooltip</div>";
      const { wrapper } = createWrapper({
        slots: { default: slotContent },
      });

      expect(wrapper.html()).toContain("Test Tooltip");
    });
  });
});

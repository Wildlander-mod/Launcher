import { flushPromises, mount } from "@vue/test-utils";
import GraphicsSelection from "@/renderer/src/components/GraphicsSelection.vue";
import { injectStrict } from "@/renderer/src/services/service-container";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("@/main/controllers/graphics/graphics.events", () => ({
  GRAPHICS_EVENTS: {
    GET_GRAPHICS: "GET_GRAPHICS",
    GET_GRAPHICS_PREFERENCE: "GET_GRAPHICS_PREFERENCE",
    SET_GRAPHICS: "SET_GRAPHICS",
  },
}));

jest.mock("electron-log/renderer", () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

interface MockIpcService {
  invoke: jest.MockedFunction<
    (event: string, ...args: unknown[]) => Promise<unknown>
  >;
}

const mockGraphics = [
  { friendly: "Low", real: "low" },
  { friendly: "Medium", real: "medium" },
  { friendly: "High", real: "high" },
];

const mockSelectOptions = [
  { text: "Low", value: "low" },
  { text: "Medium", value: "medium" },
  { text: "High", value: "high" },
];

const selectors = {
  graphicsDropdown: byTestId("graphics-dropdown"),
};

describe("GraphicsSelection #renderer #component", () => {
  let mockIpcService: MockIpcService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockImplementation((event: string) => {
        if (event === "GET_GRAPHICS") {
          return Promise.resolve(mockGraphics);
        }
        if (event === "GET_GRAPHICS_PREFERENCE") {
          return Promise.resolve("medium");
        }
        return Promise.resolve(null);
      }),
    };

    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = () =>
    mount(GraphicsSelection, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("initial render (before created() resolves)", () => {
    it("should not render the dropdown while data is loading", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.graphicsDropdown).exists()).toBe(false);
    });
  });

  describe("post-creation render (after created() resolves)", () => {
    it("should render the dropdown once data has loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.graphicsDropdown).exists()).toBe(true);
    });

    it("should pass the matched preset as currentSelection", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("currentSelection")
      ).toEqual(mockSelectOptions[1]);
    });

    it("should pass all presets as options", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findComponent({ name: "BaseDropdown" }).props("options")
      ).toEqual(mockSelectOptions);
    });

    it("should pass grow as true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findComponent({ name: "BaseDropdown" }).props("grow")
      ).toBe(true);
    });

    it("should pass showTooltipOnHover as true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("showTooltipOnHover")
      ).toBe(true);
    });

    it("should fall back to the first preset when the stored preference is not found in the presets list", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_GRAPHICS") return Promise.resolve(mockGraphics);
        if (event === "GET_GRAPHICS_PREFERENCE")
          return Promise.resolve("unknown-value");
        return Promise.resolve(null);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("currentSelection")
      ).toEqual(mockSelectOptions[0]);
    });
  });

  describe("graphics selection change", () => {
    it("should emit graphics-loading with true when a new option is selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);

      expect(wrapper.emitted("graphics-loading")).toContainEqual([true]);
    });

    it("should emit graphics-loading with false after the new selection is persisted", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(wrapper.emitted("graphics-loading")).toContainEqual([false]);
    });

    it("should call SET_GRAPHICS with the new value when an option is selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("SET_GRAPHICS", "low");
    });

    it("should update currentSelection to the newly selected option", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("currentSelection")
      ).toEqual(mockSelectOptions[0]);
    });

    it("should call SET_GRAPHICS even when the same option is re-selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // "medium" is already the active selection
      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_GRAPHICS",
        "medium"
      );
    });
  });
});

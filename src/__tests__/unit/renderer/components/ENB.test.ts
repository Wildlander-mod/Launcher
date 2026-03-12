import { flushPromises, mount } from "@vue/test-utils";
import ENB from "@/renderer/src/components/ENB.vue";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/src/services/service-container";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";
import { createMockEventService } from "@/__tests__/unit/renderer/utils/mock-event-service";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/renderer/src/services/event.service";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    EVENT_SERVICE: Symbol("EVENT_SERVICE"),
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("@/main/controllers/enb/enb.events", () => ({
  ENB_EVENTS: {
    GET_ENB_PRESETS: "GET_ENB_PRESETS",
    GET_ENB_PREFERENCE: "GET_ENB_PREFERENCE",
    SET_ENB_PREFERENCE: "SET_ENB_PREFERENCE",
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

const mockPresets = [
  { friendly: "Performance", real: "performance" },
  { friendly: "Balanced", real: "balanced" },
  { friendly: "Quality", real: "quality" },
];

const mockSelectOptions = [
  { text: "Performance", value: "performance" },
  { text: "Balanced", value: "balanced" },
  { text: "Quality", value: "quality" },
];

const selectors = {
  enbDropdown: byTestId("enb-dropdown"),
};

describe("ENB #renderer #component", () => {
  let mockIpcService: MockIpcService;
  let mockEventService: ReturnType<typeof createMockEventService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockImplementation((event: string) => {
        if (event === "GET_ENB_PRESETS") {
          return Promise.resolve(mockPresets);
        }
        if (event === "GET_ENB_PREFERENCE") {
          return Promise.resolve("balanced");
        }
        return Promise.resolve(null);
      }),
    };

    mockEventService = createMockEventService();

    // Use mockImplementation keyed on SERVICE_BINDINGS symbol to avoid relying on call order
    mockInjectStrict.mockImplementation((binding) => {
      if (binding === SERVICE_BINDINGS.EVENT_SERVICE) return mockEventService;
      return mockIpcService;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = () =>
    mount(ENB, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("initial render (before created() resolves)", () => {
    it("should not render the dropdown while presets are loading", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.enbDropdown).exists()).toBe(false);
    });
  });

  describe("post-creation render (after created() resolves)", () => {
    it("should render the dropdown once presets and preference have loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.enbDropdown).exists()).toBe(true);
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
        if (event === "GET_ENB_PRESETS") return Promise.resolve(mockPresets);
        if (event === "GET_ENB_PREFERENCE")
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

  describe("ENB selection change", () => {
    it("should emit enb-loading with true when a new ENB is selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);

      expect(wrapper.emitted("enb-loading")).toContainEqual([true]);
    });

    it("should emit enb-loading with false after the new selection is persisted", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(wrapper.emitted("enb-loading")).toContainEqual([false]);
    });

    it("should emit ENABLE_LOADING_EVENT via event service when a new ENB is selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should emit DISABLE_LOADING_EVENT via event service after the new selection is persisted", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });

    it("should call SET_ENB_PREFERENCE with the new value when the ENB changes", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_ENB_PREFERENCE",
        "performance"
      );
    });

    it("should update currentSelection to the newly selected ENB", async () => {
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

    it("should call SET_ENB_PREFERENCE when selectedEnb is null at the time of selection", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // Force selectedEnb to null to exercise the ?. null branch on line 76
      wrapper.vm.selectedEnb = null;

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_ENB_PREFERENCE",
        "performance"
      );
    });

    it("should not call SET_ENB_PREFERENCE when the same ENB is re-selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // "balanced" is already the active selection
      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(mockIpcService.invoke).not.toHaveBeenCalledWith(
        "SET_ENB_PREFERENCE",
        expect.anything()
      );
    });

    it("should still emit enb-loading with true when the same ENB is re-selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);

      expect(wrapper.emitted("enb-loading")).toContainEqual([true]);
    });

    it("should still emit enb-loading with false when the same ENB is re-selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(wrapper.emitted("enb-loading")).toContainEqual([false]);
    });

    it("should still emit ENABLE_LOADING_EVENT when the same ENB is re-selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should still emit DISABLE_LOADING_EVENT when the same ENB is re-selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });
  });
});

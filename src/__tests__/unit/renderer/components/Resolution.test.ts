import { flushPromises, mount } from "@vue/test-utils";
import Resolution from "@/renderer/src/components/Resolution.vue";
import { injectStrict } from "@/renderer/src/services/service-container";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("@/main/controllers/resolution/resolution.events", () => ({
  RESOLUTION_EVENTS: {
    GET_RESOLUTIONS: "GET_RESOLUTIONS",
    IS_UNSUPPORTED_RESOLUTION: "IS_UNSUPPORTED_RESOLUTION",
    GET_RESOLUTION_PREFERENCE: "GET_RESOLUTION_PREFERENCE",
    SET_RESOLUTION_PREFERENCE: "SET_RESOLUTION_PREFERENCE",
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
    (event: string, args?: unknown) => Promise<unknown>
  >;
}

// 1920x1080 = standard (supported), 2560x1080 = ultrawide (unsupported)
const mockResolutions = [
  { width: 1920, height: 1080 },
  { width: 2560, height: 1080 },
];

const mockPreference = { width: 1920, height: 1080 };

const mockSelectOptions = [
  {
    text: "1920 x 1080",
    value: { width: 1920, height: 1080 },
    disabled: false,
  },
  { text: "2560 x 1080", value: { width: 2560, height: 1080 }, disabled: true },
];

const selectors = {
  resolutionDropdown: byTestId("resolution-dropdown"),
  ultrawideWarning: byTestId("ultrawide-warning"),
};

describe("Resolution #renderer #component", () => {
  let mockIpcService: MockIpcService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest
        .fn()
        .mockImplementation(
          (event: string, args?: { width?: number; height?: number }) => {
            if (event === "GET_RESOLUTIONS")
              return Promise.resolve(mockResolutions);
            if (event === "GET_RESOLUTION_PREFERENCE")
              return Promise.resolve(mockPreference);
            if (event === "IS_UNSUPPORTED_RESOLUTION") {
              return Promise.resolve(
                args?.width === 2560 && args?.height === 1080
              );
            }
            return Promise.resolve(null);
          }
        ),
    };

    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = () =>
    mount(Resolution, {
      shallow: true,
      global: { renderStubDefaultSlot: true },
    });

  describe("initial render (before created() resolves)", () => {
    it("should not render the dropdown while data is loading", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.resolutionDropdown).exists()).toBe(false);
    });
  });

  describe("post-creation render (after created() resolves)", () => {
    it("should render the dropdown once data has loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.resolutionDropdown).exists()).toBe(true);
    });

    it("should pass resolutions as options with correct text, value, and disabled flag", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findComponent({ name: "BaseDropdown" }).props("options")
      ).toEqual(mockSelectOptions);
    });

    it("should pass the resolution preference as currentSelection", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("currentSelection")
      ).toEqual(mockSelectOptions[0]);
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
  });

  describe("disabled flag fallback", () => {
    it("should default disabled to false when IS_UNSUPPORTED_RESOLUTION returns null", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_RESOLUTIONS")
          return Promise.resolve(mockResolutions);
        if (event === "GET_RESOLUTION_PREFERENCE")
          return Promise.resolve(mockPreference);
        if (event === "IS_UNSUPPORTED_RESOLUTION") return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const wrapper = createWrapper();
      await flushPromises();

      const options = wrapper
        .findComponent({ name: "BaseDropdown" })
        .props("options") as { disabled: boolean }[];

      expect(options.every((o) => o.disabled === false)).toBe(true);
    });
  });

  describe("ultrawide warning", () => {
    it("should not show the ultrawide warning when no resolutions are unsupported", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_RESOLUTIONS")
          return Promise.resolve(mockResolutions);
        if (event === "GET_RESOLUTION_PREFERENCE")
          return Promise.resolve(mockPreference);
        if (event === "IS_UNSUPPORTED_RESOLUTION")
          return Promise.resolve(false);
        return Promise.resolve(null);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.ultrawideWarning).exists()).toBe(false);
    });

    it("should show the ultrawide warning when at least one resolution is unsupported", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.ultrawideWarning).exists()).toBe(true);
    });
  });

  describe("resolution selection", () => {
    it("should emit resolution-loading with true when a resolution is selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);

      expect(wrapper.emitted("resolution-loading")).toContainEqual([true]);
    });

    it("should emit resolution-loading with false after the selection is persisted", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(wrapper.emitted("resolution-loading")).toContainEqual([false]);
    });

    it("should call SET_RESOLUTION_PREFERENCE with the correct width and height", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_RESOLUTION_PREFERENCE",
        { height: 1080, width: 2560 }
      );
    });

    it("should update currentSelection to the newly selected resolution", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[1]);
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("currentSelection")
      ).toEqual(mockSelectOptions[1]);
    });
  });
});

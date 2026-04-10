import { mount } from "@vue/test-utils";
import TheTitleBar from "../../../../renderer/src/components/TheTitleBar.vue";
import { injectStrict } from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("../../../../main/controllers/window/window.events", () => ({
  WINDOW_EVENTS: {
    CLOSE: "CLOSE",
    MINIMIZE: "MINIMIZE",
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

interface MockIpcService {
  invoke: jest.MockedFunction<
    (event: string, ...args: unknown[]) => Promise<unknown>
  >;
}

const selectors = {
  minimizeButton: byTestId("minimize-button"),
  closeButton: byTestId("close-button"),
};

const createWrapper = (props: Record<string, unknown> = {}) =>
  mount(TheTitleBar, {
    shallow: true,
    props,
    global: {
      renderStubDefaultSlot: true,
    },
  });

describe("TheTitleBar #renderer #component", () => {
  let mockIpcService: MockIpcService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIpcService = { invoke: jest.fn().mockResolvedValue(null) };
    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("minimize button", () => {
    it("should render the minimize button", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.minimizeButton).exists()).toBe(true);
    });

    it("should invoke MINIMIZE when the minimize button is clicked", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.minimizeButton).trigger("click");

      expect(mockIpcService.invoke).toHaveBeenCalledWith("MINIMIZE");
    });
  });

  describe("close button", () => {
    it("should render the close button", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.closeButton).exists()).toBe(true);
    });

    it("should invoke CLOSE when the close button is clicked", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.closeButton).trigger("click");

      expect(mockIpcService.invoke).toHaveBeenCalledWith("CLOSE");
    });
  });

  describe("grow prop", () => {
    it("should add l-no-flex-grow class when grow is false", () => {
      const wrapper = createWrapper({ grow: false });

      expect(wrapper.classes()).toContain("l-no-flex-grow");
    });

    it("should not add l-no-flex-grow class when grow is true", () => {
      const wrapper = createWrapper({ grow: true });

      expect(wrapper.classes()).not.toContain("l-no-flex-grow");
    });
  });
});

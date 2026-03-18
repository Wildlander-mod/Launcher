import { mount } from "@vue/test-utils";
import AutoUpdate from "@/renderer/src/views/AutoUpdate.vue";
import { injectStrict } from "@/renderer/src/services/service-container";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("@/main/controllers/update/update.events", () => ({
  UPDATE_EVENTS: {
    UPDATE_AVAILABLE: "update-available",
    DOWNLOAD_PROGRESS: "download-progress",
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

interface MockIpcService {
  on: jest.MockedFunction<
    (channel: string, listener: (...args: unknown[]) => void) => void
  >;
}

const selectors = {
  loading: byTestId("auto-update-loading"),
  content: byTestId("auto-update-content"),
  progress: byTestId("auto-update-progress"),
};

function triggerListener(
  ipcListeners: Record<string, (...args: unknown[]) => void>,
  channel: string,
  ...args: unknown[]
): void {
  const listener = ipcListeners[channel];
  if (listener) {
    listener(...args);
  }
}

describe("AutoUpdate #renderer #view", () => {
  let mockIpcService: MockIpcService;
  let ipcListeners: Record<string, (...args: unknown[]) => void>;

  beforeEach(() => {
    jest.clearAllMocks();
    ipcListeners = {};
    mockIpcService = {
      on: jest.fn((channel: string, listener: (...args: unknown[]) => void) => {
        ipcListeners[channel] = listener;
      }),
    };
    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = () =>
    mount(AutoUpdate, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("initial render", () => {
    it("should show the loading state", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.loading).exists()).toBe(true);
    });

    it("should hide the update content", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.content).exists()).toBe(false);
    });

    it("should register a listener for UPDATE_AVAILABLE", () => {
      createWrapper();

      expect(mockIpcService.on).toHaveBeenCalledWith(
        "update-available",
        expect.any(Function)
      );
    });

    it("should register a listener for DOWNLOAD_PROGRESS", () => {
      createWrapper();

      expect(mockIpcService.on).toHaveBeenCalledWith(
        "download-progress",
        expect.any(Function)
      );
    });
  });

  describe("UPDATE_AVAILABLE event", () => {
    it("should hide the loading state after UPDATE_AVAILABLE fires", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "update-available");
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.loading).exists()).toBe(false);
    });

    it("should show the update content after UPDATE_AVAILABLE fires", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "update-available");
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.content).exists()).toBe(true);
    });

    it("should display 0% download progress after UPDATE_AVAILABLE fires", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "update-available");
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.progress).text()).toContain("0%");
    });
  });

  describe("DOWNLOAD_PROGRESS event", () => {
    it("should hide the loading state after DOWNLOAD_PROGRESS fires", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "download-progress", 42);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.loading).exists()).toBe(false);
    });

    it("should show the update content after DOWNLOAD_PROGRESS fires", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "download-progress", 42);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.content).exists()).toBe(true);
    });

    it("should display the received progress value", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "download-progress", 42);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.progress).text()).toContain("42%");
    });

    it("should update the progress value when DOWNLOAD_PROGRESS fires again", async () => {
      const wrapper = createWrapper();

      triggerListener(ipcListeners, "download-progress", 42);
      await wrapper.vm.$nextTick();

      triggerListener(ipcListeners, "download-progress", 75);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.progress).text()).toContain("75%");
    });
  });
});

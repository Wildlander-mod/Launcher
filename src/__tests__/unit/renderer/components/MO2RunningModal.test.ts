import { flushPromises, mount } from "@vue/test-utils";
import MO2RunningModal from "../../../../renderer/src/components/MO2RunningModal.vue";
import { injectStrict } from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock(
  "../../../../main/controllers/modOrganizer/modOrganizer.events",
  () => ({
    MOD_ORGANIZER_EVENTS: {
      IS_MO2_RUNNING: "IS_MO2_RUNNING",
      CLOSE_MO2: "CLOSE_MO2",
    },
  })
);

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

interface MockIpcService {
  invoke: jest.MockedFunction<
    (event: string, ...args: unknown[]) => Promise<unknown>
  >;
}

const selectors = {
  killButton: byTestId("kill-mo2-processes"),
};

describe("MO2RunningModal #renderer #component", () => {
  let mockIpcService: MockIpcService;

  const createWrapper = () =>
    mount(MO2RunningModal, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockResolvedValue(false),
    };

    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("created lifecycle", () => {
    it("should invoke IS_MO2_RUNNING on created", async () => {
      createWrapper();
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("IS_MO2_RUNNING");
    });

    it("should pass show-modal as false to AppModal when IS_MO2_RUNNING returns false", async () => {
      mockIpcService.invoke.mockResolvedValue(false);
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findComponent({ name: "AppModal" }).props("showModal")
      ).toBe(false);
    });

    it("should pass show-modal as true to AppModal when IS_MO2_RUNNING returns true", async () => {
      mockIpcService.invoke.mockResolvedValue(true);
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findComponent({ name: "AppModal" }).props("showModal")
      ).toBe(true);
    });
  });

  describe("polling behaviour", () => {
    it("should invoke IS_MO2_RUNNING again after 1000ms", async () => {
      createWrapper();
      await flushPromises();

      jest.advanceTimersByTime(1000);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledTimes(2);
    });

    it("should invoke IS_MO2_RUNNING a third time after 2000ms", async () => {
      createWrapper();
      await flushPromises();

      jest.advanceTimersByTime(1000);
      await flushPromises();

      jest.advanceTimersByTime(1000);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledTimes(3);
    });
  });

  describe("kill button interaction", () => {
    it("should render the kill button", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.killButton).exists()).toBe(true);
    });

    it("should invoke CLOSE_MO2 when kill button is clicked", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.killButton).trigger("click");

      expect(mockIpcService.invoke).toHaveBeenCalledWith("CLOSE_MO2");
    });
  });
});

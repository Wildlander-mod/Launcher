import { flushPromises, mount } from "@vue/test-utils";
import ViewAdvanced from "../../../../renderer/src/views/ViewAdvanced.vue";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";
import { createMockEventService } from "../utils/mock-event-service";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "../../../../renderer/src/services/event.service";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    EVENT_SERVICE: Symbol("EVENT_SERVICE"),
    MESSAGE_SERVICE: Symbol("MESSAGE_SERVICE"),
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("../../../../main/controllers/profile/profile.events", () => ({
  PROFILE_EVENTS: {
    GET_SHOW_HIDDEN_PROFILES: "GET_SHOW_HIDDEN_PROFILES",
    SET_SHOW_HIDDEN_PROFILES: "SET_SHOW_HIDDEN_PROFILES",
    RESTORE_PROFILES: "RESTORE_PROFILES",
  },
}));

jest.mock("../../../../main/controllers/launcher/launcher.events", () => ({
  LAUNCHER_EVENTS: {
    GET_CHECK_PREREQUISITES: "GET_CHECK_PREREQUISITES",
    SET_CHECK_PREREQUISITES: "SET_CHECK_PREREQUISITES",
  },
}));

jest.mock(
  "../../../../main/controllers/modOrganizer/modOrganizer.events",
  () => ({
    MOD_ORGANIZER_EVENTS: {
      LAUNCH_MO2: "LAUNCH_MO2",
    },
  })
);

jest.mock("../../../../main/controllers/system/system.events", () => ({
  SYSTEM_EVENTS: {
    OPEN_APPLICATION_LOGS: "OPEN_APPLICATION_LOGS",
    CLEAR_APP_LOGS: "CLEAR_APP_LOGS",
    OPEN_CRASH_LOGS: "OPEN_CRASH_LOGS",
  },
}));

jest.mock("../../../../main/controllers/enb/enb.events", () => ({
  ENB_EVENTS: {
    RESTORE_ENB_PRESETS: "RESTORE_ENB_PRESETS",
  },
}));

jest.mock("../../../../main/controllers/graphics/graphics.events", () => ({
  GRAPHICS_EVENTS: {
    RESTORE_GRAPHICS: "RESTORE_GRAPHICS",
  },
}));

jest.mock("../../../../main/controllers/config/config.events", () => ({
  CONFIG_EVENTS: {
    EDIT_CONFIG: "EDIT_CONFIG",
  },
}));

jest.mock("@vueform/toggle", () => ({
  default: { name: "Toggle", props: ["modelValue"], template: "<div />" },
}));

jest.mock("vue3-popper", () => ({
  default: {
    name: "Popper",
    template: "<div><slot /><slot name='content' /></div>",
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

interface MockMessageService {
  confirmation: jest.MockedFunction<
    (message: string, buttons: string[]) => Promise<{ response: number }>
  >;
  error: jest.MockedFunction<
    (opts: { title: string; error: string }) => Promise<void>
  >;
}

const selectors = {
  launchMO2: byTestId("launch-mo2"),
  openAppLogs: byTestId("open-app-logs"),
  clearAppLogs: byTestId("clear-app-logs"),
  openCrashLogs: byTestId("open-crash-logs"),
  editConfig: byTestId("edit-config-button"),
  showHiddenProfilesToggle: byTestId("show-hidden-profiles-toggle"),
  checkPrerequisitesToggle: byTestId("check-prerequisites-toggle"),
  restoreEnbPresets: byTestId("restore-enb-presets"),
  restoreMO2Profiles: byTestId("restore-mo2-profiles"),
  restoreGraphicsPresets: byTestId("restore-graphics-presets"),
};

describe("ViewAdvanced #renderer #view", () => {
  let mockIpcService: MockIpcService;
  let mockMessageService: MockMessageService;
  let mockEventService: ReturnType<typeof createMockEventService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockResolvedValue(false),
    };

    mockMessageService = {
      confirmation: jest.fn().mockResolvedValue({ response: 0 }),
      error: jest.fn().mockResolvedValue(undefined),
    };

    mockEventService = createMockEventService();

    mockInjectStrict.mockImplementation((binding) => {
      if (binding === SERVICE_BINDINGS.EVENT_SERVICE) return mockEventService;
      if (binding === SERVICE_BINDINGS.MESSAGE_SERVICE)
        return mockMessageService;
      return mockIpcService;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = () =>
    mount(ViewAdvanced, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("created() lifecycle", () => {
    it("should call IPC to fetch showHiddenProfiles", () => {
      createWrapper();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "GET_SHOW_HIDDEN_PROFILES"
      );
    });

    it("should call IPC to fetch checkPrerequisites", async () => {
      createWrapper();
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "GET_CHECK_PREREQUISITES"
      );
    });

    it("should set showHiddenProfiles to true when IPC returns true", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_SHOW_HIDDEN_PROFILES") return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.showHiddenProfiles).toBe(true);
    });

    it("should set showHiddenProfiles to false when IPC returns false", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_SHOW_HIDDEN_PROFILES") return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.showHiddenProfiles).toBe(false);
    });

    it("should set checkPrerequisites to false when IPC returns false", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_CHECK_PREREQUISITES") return Promise.resolve(false);
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.checkPrerequisites).toBe(false);
    });

    it("should set checkPrerequisites to true when IPC returns true", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_CHECK_PREREQUISITES") return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.checkPrerequisites).toBe(true);
    });

    it("should default checkPrerequisites to true when IPC returns undefined", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_CHECK_PREREQUISITES")
          return Promise.resolve(undefined);
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.checkPrerequisites).toBe(true);
    });
  });

  describe("Launch MO2 button", () => {
    it("should emit ENABLE_LOADING_EVENT on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.launchMO2).trigger("click");

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should invoke LAUNCH_MO2 on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.launchMO2).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("LAUNCH_MO2");
    });

    it("should emit DISABLE_LOADING_EVENT after a successful launch", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.launchMO2).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });

    it("should show an error dialog when LAUNCH_MO2 throws", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "LAUNCH_MO2")
          return Promise.reject(new Error("MO2 failed"));
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.launchMO2).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Failed to launch MO2" })
      );
    });

    it("should use String(error) when LAUNCH_MO2 throws a non-Error value", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "LAUNCH_MO2") return Promise.reject("plain error");
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.launchMO2).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: "plain error" })
      );
    });

    it("should emit DISABLE_LOADING_EVENT even when LAUNCH_MO2 throws", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "LAUNCH_MO2")
          return Promise.reject(new Error("MO2 failed"));
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.launchMO2).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });
  });

  describe("Application logs buttons", () => {
    it("should invoke OPEN_APPLICATION_LOGS when Open is clicked", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.openAppLogs).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "OPEN_APPLICATION_LOGS"
      );
    });

    it("should invoke CLEAR_APP_LOGS when Clear is clicked", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.clearAppLogs).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("CLEAR_APP_LOGS");
    });
  });

  describe("Skyrim crash logs button", () => {
    it("should invoke OPEN_CRASH_LOGS when Open is clicked", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.openCrashLogs).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("OPEN_CRASH_LOGS");
    });
  });

  describe("Edit config button", () => {
    it("should invoke EDIT_CONFIG on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.editConfig).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("EDIT_CONFIG");
    });
  });

  describe("Show hidden profiles toggle", () => {
    it("should invoke SET_SHOW_HIDDEN_PROFILES when the toggle is clicked", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.showHiddenProfilesToggle).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_SHOW_HIDDEN_PROFILES",
        expect.anything()
      );
    });
  });

  describe("Check prerequisites toggle", () => {
    it("should invoke SET_CHECK_PREREQUISITES when the toggle is clicked", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.checkPrerequisitesToggle).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_CHECK_PREREQUISITES",
        expect.anything()
      );
    });
  });

  describe("Restore ENB presets button", () => {
    it("should emit ENABLE_LOADING_EVENT on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should call messageService.confirmation on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockMessageService.confirmation).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array)
      );
    });

    it("should invoke RESTORE_ENB_PRESETS when the user confirms", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("RESTORE_ENB_PRESETS");
    });

    it("should not invoke RESTORE_ENB_PRESETS when the user cancels", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 0 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).not.toHaveBeenCalledWith(
        "RESTORE_ENB_PRESETS"
      );
    });

    it("should show an error dialog when RESTORE_ENB_PRESETS throws", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "RESTORE_ENB_PRESETS")
          return Promise.reject(new Error("restore failed"));
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error restoring ENB files" })
      );
    });

    it("should use String(error) when RESTORE_ENB_PRESETS throws a non-Error value", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "RESTORE_ENB_PRESETS")
          return Promise.reject("plain error");
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: "plain error" })
      );
    });

    it("should emit DISABLE_LOADING_EVENT after the user confirms", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });

    it("should emit DISABLE_LOADING_EVENT after the user cancels", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 0 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreEnbPresets).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });
  });

  describe("Restore MO2 profiles button", () => {
    it("should emit ENABLE_LOADING_EVENT on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should call messageService.confirmation on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockMessageService.confirmation).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array)
      );
    });

    it("should invoke RESTORE_PROFILES when the user confirms", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("RESTORE_PROFILES");
    });

    it("should not invoke RESTORE_PROFILES when the user cancels", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 0 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).not.toHaveBeenCalledWith(
        "RESTORE_PROFILES"
      );
    });

    it("should show an error dialog when RESTORE_PROFILES throws", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "RESTORE_PROFILES")
          return Promise.reject(new Error("restore failed"));
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error restoring MO2 profiles" })
      );
    });

    it("should use String(error) when RESTORE_PROFILES throws a non-Error value", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "RESTORE_PROFILES") return Promise.reject("plain error");
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: "plain error" })
      );
    });

    it("should emit DISABLE_LOADING_EVENT after the user confirms", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });

    it("should emit DISABLE_LOADING_EVENT after the user cancels", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 0 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreMO2Profiles).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });
  });

  describe("Restore graphics presets button", () => {
    it("should emit ENABLE_LOADING_EVENT on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should call messageService.confirmation on click", async () => {
      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockMessageService.confirmation).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array)
      );
    });

    it("should invoke RESTORE_GRAPHICS when the user confirms", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("RESTORE_GRAPHICS");
    });

    it("should not invoke RESTORE_GRAPHICS when the user cancels", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 0 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).not.toHaveBeenCalledWith(
        "RESTORE_GRAPHICS"
      );
    });

    it("should show an error dialog when RESTORE_GRAPHICS throws", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "RESTORE_GRAPHICS")
          return Promise.reject(new Error("restore failed"));
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error restoring graphics presets" })
      );
    });

    it("should use String(error) when RESTORE_GRAPHICS throws a non-Error value", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "RESTORE_GRAPHICS") return Promise.reject("plain error");
        return Promise.resolve(false);
      });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: "plain error" })
      );
    });

    it("should emit DISABLE_LOADING_EVENT after the user confirms", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 1 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });

    it("should emit DISABLE_LOADING_EVENT after the user cancels", async () => {
      mockMessageService.confirmation.mockResolvedValue({ response: 0 });

      const wrapper = createWrapper();

      await wrapper.find(selectors.restoreGraphicsPresets).trigger("click");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(DISABLE_LOADING_EVENT);
    });
  });
});

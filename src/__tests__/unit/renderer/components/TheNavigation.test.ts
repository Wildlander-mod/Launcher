import { flushPromises, mount } from "@vue/test-utils";
import TheNavigation from "@/renderer/src/components/TheNavigation.vue";
import { injectStrict } from "@/renderer/src/services/service-container";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("@/main/controllers/wabbajack/wabbajack.events", () => ({
  WABBAJACK_EVENTS: { GET_MODPACK_VERSION: "GET_MODPACK_VERSION" },
}));

jest.mock("@/main/controllers/modpack/mopack.events", () => ({
  MODPACK_EVENTS: { GET_MODPACK_METADATA: "GET_MODPACK_METADATA" },
}));

jest.mock("@/main/controllers/launcher/launcher.events", () => ({
  LAUNCHER_EVENTS: { GET_VERSION: " GET_VERSION" },
}));

jest.mock("@/main/controllers/modOrganizer/modOrganizer.events", () => ({
  MOD_ORGANIZER_EVENTS: { LAUNCH_GAME: "LAUNCH_GAME" },
}));

jest.mock("@/main/controllers/system/system.events", () => ({
  SYSTEM_EVENTS: {
    CHECK_PREREQUISITES: "CHECK_PREREQUISITES",
    INSTALL_PREREQUISITES: "INSTALL_PREREQUISITES",
    REBOOT: "REBOOT",
  },
}));

jest.mock("@/main/controllers/dialog/dialog.events", () => ({
  DIALOG_EVENTS: { ERROR: "ERROR" },
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

const selectors = {
  launchButton: byTestId("launch-game"),
  navigationContainer: byTestId("navigation-container"),
  launcherInfo: byTestId("launcher-info"),
  modpackVersion: byTestId("modpack-version"),
  contributeLink: byTestId("contribute-link"),
  gameRunningModal: byTestId("game-running-modal"),
};

const mockNavigate = jest.fn();

const RouterLinkStub = {
  name: "RouterLink",
  props: ["to"],
  template: `<div><slot :href="'/'" :navigate="navigate" :isActive="false" /></div>`,
  setup() {
    return { navigate: mockNavigate };
  },
};

const createWrapper = () =>
  mount(TheNavigation, {
    shallow: true,
    global: {
      stubs: { RouterLink: RouterLinkStub },
      renderStubDefaultSlot: true,
    },
  });

/**
 * Returns resolved promises for the three IPC calls made in created().
 * Use this as the fallthrough in custom mockImplementation overrides so
 * the component can always initialise correctly.
 */
const resolveInitEvents = (event: string): Promise<unknown> => {
  if (event === "GET_MODPACK_METADATA") {
    return Promise.resolve({ name: "Test Modpack" });
  }
  if (event === "GET_MODPACK_VERSION") {
    return Promise.resolve("1.0.0");
  }
  if (event === " GET_VERSION") {
    return Promise.resolve("2.0.0");
  }
  return Promise.resolve(null);
};

describe("TheNavigation #renderer #component", () => {
  let mockIpcService: MockIpcService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockImplementation((event: string) => {
        if (event === "CHECK_PREREQUISITES") {
          return Promise.resolve(true);
        }
        return resolveInitEvents(event);
      }),
    };

    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("initialisation", () => {
    it("mounts successfully", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
      expect(selectors).toBeDefined();
      expect(mockNavigate).toBeDefined();
    });

    it("should display modpackName in the launch message after creation", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.gameRunningModal).text()).toContain(
        "Test Modpack"
      );
    });

    it("should display modpackVersion in launcher info after creation", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.modpackVersion).text()).toContain("1.0.0");
    });

    it("should pass launcherVersion to LauncherVersion component after creation", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const launcherVersion = wrapper.findComponent({
        name: "LauncherVersion",
      });
      expect(launcherVersion.props("version")).toBe("2.0.0");
    });
  });

  describe("launch button", () => {
    it("should render the launch button", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.launchButton).exists()).toBe(true);
    });

    it("should have the launch button enabled when isLoading is false", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.launchButton).attributes("disabled")).toBe(
        "false"
      );
    });

    it("should have the launch button disabled after profile-loading emits true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const profileSelection = wrapper.findComponent({
        name: "ProfileSelection",
      });
      await profileSelection.vm.$emit("profile-loading", true);

      expect(wrapper.find(selectors.launchButton).attributes("disabled")).toBe(
        "true"
      );
    });

    it("should invoke CHECK_PREREQUISITES when the launch button is clicked and not loading", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.launchButton).trigger("click");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("CHECK_PREREQUISITES");
    });
  });

  describe("launchGame()", () => {
    const findGameRunningModal = (wrapper: ReturnType<typeof createWrapper>) =>
      wrapper
        .findAllComponents({ name: "AppModal" })
        .find((m) => m.props("name") === "gameRunning");

    const findRebootModal = (wrapper: ReturnType<typeof createWrapper>) =>
      wrapper
        .findAllComponents({ name: "AppModal" })
        .find((m) => m.props("name") === "rebootModal");

    /**
     * Overrides the IPC mock so CHECK_PREREQUISITES returns a pending promise,
     * allowing intermediate state assertions before the check resolves.
     * Returns `resolveCheck` to settle the promise in cleanup.
     */
    const setupDeferredCheck = (): {
      resolveCheck: (value: boolean) => void;
    } => {
      let resolveCheck!: (value: boolean) => void;
      const checkPromise = new Promise<boolean>((resolve) => {
        resolveCheck = resolve;
      });
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "CHECK_PREREQUISITES") {
          return checkPromise;
        }
        return resolveInitEvents(event);
      });
      return { resolveCheck };
    };

    describe("happy path - prerequisites already installed", () => {
      it("should set gameRunning to true immediately on click", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");

        expect(findGameRunningModal(wrapper)?.props("showModal")).toBe(true);
      });

      it("should invoke LAUNCH_GAME when prerequisites are installed", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(mockIpcService.invoke).toHaveBeenCalledWith("LAUNCH_GAME");
      });

      it("should reset gameRunning to false after game launches", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(findGameRunningModal(wrapper)?.props("showModal")).toBe(false);
      });
    });

    describe("prerequisites not installed - install succeeds", () => {
      beforeEach(() => {
        let checkCount = 0;
        mockIpcService.invoke.mockImplementation((event: string) => {
          if (event === "CHECK_PREREQUISITES") {
            checkCount += 1;
            return checkCount === 1
              ? Promise.resolve(false)
              : Promise.resolve(true);
          }
          return resolveInitEvents(event);
        });
      });

      it("should show the checking message immediately after click", async () => {
        const { resolveCheck } = setupDeferredCheck();

        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");

        expect(wrapper.find(selectors.gameRunningModal).text()).toContain(
          "prerequisites are installed"
        );

        resolveCheck(false);
        await flushPromises();
      });

      it("should not show the checking message after the check resolves", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(wrapper.find(selectors.gameRunningModal).text()).not.toContain(
          "prerequisites are installed"
        );
      });

      it("should invoke INSTALL_PREREQUISITES when prerequisites are not installed", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(mockIpcService.invoke).toHaveBeenCalledWith(
          "INSTALL_PREREQUISITES"
        );
      });

      it("should show the installing message while installation is in progress", async () => {
        let resolveInstall!: () => void;
        const installPromise = new Promise<null>((resolve) => {
          resolveInstall = () => resolve(null);
        });

        let checkCount = 0;
        mockIpcService.invoke.mockImplementation((event: string) => {
          if (event === "CHECK_PREREQUISITES") {
            checkCount += 1;
            return checkCount === 1
              ? Promise.resolve(false)
              : Promise.resolve(true);
          }
          if (event === "INSTALL_PREREQUISITES") {
            return installPromise;
          }
          return resolveInitEvents(event);
        });

        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(wrapper.find(selectors.gameRunningModal).text()).toContain(
          "prerequisites are currently installing"
        );

        resolveInstall();
        await flushPromises();
      });

      it("should set rebootRequired to true after successful installation", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(findRebootModal(wrapper)?.props("showModal")).toBe(true);
      });

      it("should not invoke LAUNCH_GAME when prerequisites required installation", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(mockIpcService.invoke).not.toHaveBeenCalledWith("LAUNCH_GAME");
      });
    });

    describe("prerequisites not installed - install fails", () => {
      beforeEach(() => {
        mockIpcService.invoke.mockImplementation((event: string) => {
          if (event === "CHECK_PREREQUISITES") {
            return Promise.resolve(false);
          }
          return resolveInitEvents(event);
        });
      });

      it("should invoke DIALOG_EVENTS.ERROR with the correct title when install fails", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(mockIpcService.invoke).toHaveBeenCalledWith(
          "ERROR",
          expect.objectContaining({ title: "Install failed" })
        );
      });

      it("should reset gameRunning to false on install failure", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(findGameRunningModal(wrapper)?.props("showModal")).toBe(false);
      });

      it("should reset checkingPrerequisites to false on install failure", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(wrapper.find(selectors.gameRunningModal).text()).not.toContain(
          "prerequisites are installed"
        );
      });

      it("should reset installingPrerequisites to false on install failure", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(wrapper.find(selectors.gameRunningModal).text()).not.toContain(
          "prerequisites are currently installing"
        );
      });

      it("should not set rebootRequired on install failure", async () => {
        const wrapper = createWrapper();
        await flushPromises();

        await wrapper.find(selectors.launchButton).trigger("click");
        await flushPromises();

        expect(findRebootModal(wrapper)?.props("showModal")).toBe(false);
      });
    });
  });

  describe("gameRunning modal", () => {
    const findGameRunningModal = (wrapper: ReturnType<typeof createWrapper>) =>
      wrapper
        .findAllComponents({ name: "AppModal" })
        .find((m) => m.props("name") === "gameRunning");

    it("should have show-modal as false initially", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(findGameRunningModal(wrapper)?.props("showModal")).toBe(false);
    });

    it("should show the launch message when not checking or installing prerequisites", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.gameRunningModal).text()).toContain(
        "Launching"
      );
    });

    it("should interpolate modpackName in the checking message", async () => {
      const checkPromise = new Promise<boolean>(() => {});
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "CHECK_PREREQUISITES") return checkPromise;
        return resolveInitEvents(event);
      });

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.launchButton).trigger("click");

      expect(wrapper.find(selectors.gameRunningModal).text()).toContain(
        "Test Modpack prerequisites are installed"
      );
    });

    it("should show modpackVersion in the launch message", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.gameRunningModal).text()).toContain(
        "1.0.0"
      );
    });
  });

  describe("rebootRequired modal", () => {
    // AppModal is custom-stubbed in createWrapperWithActionSlots so that the named
    // #action slot is rendered, allowing interaction with the reboot button (which
    // lives in that slot and is not rendered by the auto-generated shallow stub).
    const AppModalWithActionSlot = {
      name: "AppModal",
      props: ["showModal", "name"],
      template: `<div :data-name="name"><slot /><slot name="action" /></div>`,
    };

    const createWrapperWithActionSlots = () =>
      mount(TheNavigation, {
        shallow: true,
        global: {
          stubs: {
            RouterLink: RouterLinkStub,
            AppModal: AppModalWithActionSlot,
          },
          renderStubDefaultSlot: true,
        },
      });

    const findRebootModal = (wrapper: ReturnType<typeof createWrapper>) =>
      wrapper
        .findAllComponents({ name: "AppModal" })
        .find((m) => m.props("name") === "rebootModal");

    it("should have show-modal as false initially", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(findRebootModal(wrapper)?.props("showModal")).toBe(false);
    });

    it("should invoke REBOOT when the reboot button is clicked", async () => {
      let checkCount = 0;
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "CHECK_PREREQUISITES") {
          checkCount += 1;
          return checkCount === 1
            ? Promise.resolve(false)
            : Promise.resolve(true);
        }
        return resolveInitEvents(event);
      });

      const wrapper = createWrapperWithActionSlots();
      await flushPromises();

      await wrapper.find(selectors.launchButton).trigger("click");
      await flushPromises();

      const buttons = wrapper.findAllComponents({ name: "BaseButton" });
      const rebootButton = buttons.find((btn) => btn.text() === "Reboot");
      await rebootButton?.trigger("click");

      expect(mockIpcService.invoke).toHaveBeenCalledWith("REBOOT");
    });
  });

  describe("loading state", () => {
    it("should enable the launch button when profile-loading emits false after being true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const profileSelection = wrapper.findComponent({
        name: "ProfileSelection",
      });
      await profileSelection.vm.$emit("profile-loading", true);
      await profileSelection.vm.$emit("profile-loading", false);

      expect(wrapper.find(selectors.launchButton).attributes("disabled")).toBe(
        "false"
      );
    });

    it("should disable the launch button when graphics-loading emits true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const graphicsSelection = wrapper.findComponent({
        name: "GraphicsSelection",
      });
      await graphicsSelection.vm.$emit("graphics-loading", true);

      expect(wrapper.find(selectors.launchButton).attributes("disabled")).toBe(
        "true"
      );
    });

    it("should disable the launch button when enb-loading emits true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const enb = wrapper.findComponent({ name: "ENB" });
      await enb.vm.$emit("enb-loading", true);

      expect(wrapper.find(selectors.launchButton).attributes("disabled")).toBe(
        "true"
      );
    });

    it("should disable the launch button when resolution-loading emits true", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const resolution = wrapper.findComponent({ name: "Resolution" });
      await resolution.vm.$emit("resolution-loading", true);

      expect(wrapper.find(selectors.launchButton).attributes("disabled")).toBe(
        "true"
      );
    });
  });

  describe("navigation items", () => {
    it("should render three NavigationItem components", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findAllComponents({ name: "NavigationItem" })
      ).toHaveLength(3);
    });

    it("should render a NavigationItem with Home text", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const items = wrapper.findAllComponents({ name: "NavigationItem" });

      expect(items[0]?.text()).toContain("Home");
    });

    it("should render a NavigationItem with Community text", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const items = wrapper.findAllComponents({ name: "NavigationItem" });

      expect(items[1]?.text()).toContain("Community");
    });

    it("should render a NavigationItem with Advanced text", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const items = wrapper.findAllComponents({ name: "NavigationItem" });

      expect(items[2]?.text()).toContain("Advanced");
    });
  });

  describe("launcher info", () => {
    it("should render the launcher info container", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.launcherInfo).exists()).toBe(true);
    });

    it("should render the contribute link with the correct href", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const contributeLink = wrapper.findComponent({ name: "BaseLink" });

      expect(contributeLink.props("href")).toBe(
        "https://github.com/Wildlander-mod/Launcher"
      );
    });
  });
});

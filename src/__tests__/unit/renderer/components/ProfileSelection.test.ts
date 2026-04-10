import { flushPromises, mount } from "@vue/test-utils";
import ProfileSelection from "../../../../renderer/src/components/ProfileSelection.vue";
import { injectStrict } from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("../../../../main/controllers/profile/profile.events", () => ({
  PROFILE_EVENTS: {
    GET_PROFILES: "GET_PROFILES",
    GET_PROFILE_PREFERENCE: "GET_PROFILE_PREFERENCE",
    SET_PROFILE_PREFERENCE: "SET_PROFILE_PREFERENCE",
    GET_SHOW_HIDDEN_PROFILES: "GET_SHOW_HIDDEN_PROFILES",
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

const mockProfiles = [
  { friendly: "Vanilla Plus", real: "vanilla-plus", hidden: false },
  { friendly: "Performance", real: "performance", hidden: false },
  { friendly: "Ultra", real: "ultra", hidden: true },
];

const mockSelectOptions = [
  {
    text: "Vanilla Plus",
    value: "vanilla-plus",
    hidden: false,
    hiddenByDefault: false,
  },
  {
    text: "Performance",
    value: "performance",
    hidden: false,
    hiddenByDefault: false,
  },
  { text: "Ultra", value: "ultra", hidden: true, hiddenByDefault: true },
];

const selectors = {
  profileDropdown: byTestId("profile-dropdown"),
};

describe("ProfileSelection #renderer #component", () => {
  let mockIpcService: MockIpcService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockImplementation((event: string) => {
        if (event === "GET_PROFILES") return Promise.resolve(mockProfiles);
        if (event === "GET_PROFILE_PREFERENCE")
          return Promise.resolve("performance");
        if (event === "GET_SHOW_HIDDEN_PROFILES") return Promise.resolve(false);
        return Promise.resolve(null);
      }),
    };

    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = () =>
    mount(ProfileSelection, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("initial render (before created() resolves)", () => {
    it("should not render the dropdown while data is loading", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.profileDropdown).exists()).toBe(false);
    });
  });

  describe("post-creation render (after created() resolves)", () => {
    it("should render the dropdown once data has loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.profileDropdown).exists()).toBe(true);
    });

    it("should pass the matched preference as currentSelection", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "BaseDropdown" })
          .props("currentSelection")
      ).toEqual(mockSelectOptions[1]);
    });

    it("should pass all profiles as options", async () => {
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

    it("should fall back to the first profile when the stored preference is not found in the list", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_PROFILES") return Promise.resolve(mockProfiles);
        if (event === "GET_PROFILE_PREFERENCE")
          return Promise.resolve("unknown-profile");
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

    it("should not render the dropdown when the profiles list is empty", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_PROFILES") return Promise.resolve([]);
        if (event === "GET_PROFILE_PREFERENCE")
          return Promise.resolve("performance");
        return Promise.resolve(null);
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.profileDropdown).exists()).toBe(false);
    });
  });

  describe("profile selection", () => {
    it("should emit profile-loading with true when a new profile is selected", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);

      expect(wrapper.emitted("profile-loading")).toContainEqual([true]);
    });

    it("should call SET_PROFILE_PREFERENCE with the selected profile value", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_PROFILE_PREFERENCE",
        "vanilla-plus"
      );
    });

    it("should update currentSelection to the newly selected profile", async () => {
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

    it("should emit profile-loading with false after the IPC call completes", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "BaseDropdown" })
        .vm.$emit("selected", mockSelectOptions[0]);
      await flushPromises();

      expect(wrapper.emitted("profile-loading")).toContainEqual([false]);
    });
  });

  describe("hidden profile toggle", () => {
    it("should set hidden to false on all profiles when GET_SHOW_HIDDEN_PROFILES returns true", async () => {
      mockIpcService.invoke.mockImplementation((event: string) => {
        if (event === "GET_PROFILES") return Promise.resolve(mockProfiles);
        if (event === "GET_PROFILE_PREFERENCE")
          return Promise.resolve("performance");
        if (event === "GET_SHOW_HIDDEN_PROFILES") return Promise.resolve(true);
        return Promise.resolve(null);
      });

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.profileDropdown).trigger("click");
      await flushPromises();

      const options = wrapper
        .findComponent({ name: "BaseDropdown" })
        .props("options") as { hidden: boolean }[];

      expect(options.every((o) => o.hidden === false)).toBe(true);
    });

    it("should revert each profile's hidden flag to its hiddenByDefault value when GET_SHOW_HIDDEN_PROFILES returns false", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(selectors.profileDropdown).trigger("click");
      await flushPromises();

      const options = wrapper
        .findComponent({ name: "BaseDropdown" })
        .props("options") as { hidden: boolean; hiddenByDefault: boolean }[];

      expect(options.map((o) => o.hidden)).toEqual(
        mockSelectOptions.map((o) => o.hiddenByDefault)
      );
    });
  });
});

import { flushPromises, mount } from "@vue/test-utils";
import ModDirectory from "../../../../renderer/src/components/ModDirectory.vue";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";
import { createMockEventService } from "../utils/mock-event-service";
import { ENABLE_LOADING_EVENT } from "../../../../renderer/src/services/event.service";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    EVENT_SERVICE: Symbol("EVENT_SERVICE"),
    IPC_SERVICE: Symbol("IPC_SERVICE"),
    MESSAGE_SERVICE: Symbol("MESSAGE_SERVICE"),
    MODPACK_SERVICE: Symbol("MODPACK_SERVICE"),
  },
}));

jest.mock("../../../../main/controllers/wabbajack/wabbajack.events", () => ({
  WABBAJACK_EVENTS: {
    GET_INSTALLED_MODPACKS: "GET_INSTALLED_MODPACKS",
  },
}));

jest.mock("../../../../main/controllers/modpack/mopack.events", () => ({
  MODPACK_EVENTS: {
    SET_MODPACK: "SET_MODPACK",
  },
}));

jest.mock("../../../../main/controllers/window/window.events", () => ({
  WINDOW_EVENTS: {
    RELOAD: "RELOAD",
  },
}));

jest.mock("../../../../shared/wildlander/modpack", () => ({
  WildlanderModpack: { name: "Wildlander" },
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

interface MockModpackService {
  getModpackDirectory: jest.MockedFunction<() => Promise<string | null>>;
  isModDirectoryValid: jest.MockedFunction<
    (filepath: string) => Promise<{ ok: boolean; missingPaths?: string[] }>
  >;
}

interface MockMessageService {
  error: jest.MockedFunction<
    (args: { title: string; error: string }) => Promise<void>
  >;
}

const mockInstalledModpacks = ["/path/to/modpack-a", "/path/to/modpack-b"];
const mockCurrentDirectory = "/path/to/modpack-a";

const selectors = {
  modDirectory: byTestId("mod-directory"),
  modDirectorySelect: byTestId("mod-directory-select"),
};

describe("ModDirectory #renderer #component", () => {
  let mockIpcService: MockIpcService;
  let mockModpackService: MockModpackService;
  let mockMessageService: MockMessageService;
  let mockEventService: ReturnType<typeof createMockEventService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockResolvedValue(null),
    };

    mockModpackService = {
      getModpackDirectory: jest.fn().mockResolvedValue(mockCurrentDirectory),
      isModDirectoryValid: jest.fn().mockResolvedValue({ ok: true }),
    };

    mockMessageService = {
      error: jest.fn().mockResolvedValue(undefined),
    };

    mockEventService = createMockEventService();

    mockIpcService.invoke.mockImplementation((event: string) => {
      if (event === "GET_INSTALLED_MODPACKS") {
        return Promise.resolve([...mockInstalledModpacks]);
      }
      return Promise.resolve(null);
    });

    mockInjectStrict.mockImplementation((binding) => {
      if (binding === SERVICE_BINDINGS.EVENT_SERVICE) return mockEventService;
      if (binding === SERVICE_BINDINGS.MESSAGE_SERVICE)
        return mockMessageService;
      if (binding === SERVICE_BINDINGS.MODPACK_SERVICE)
        return mockModpackService;
      return mockIpcService;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createWrapper = (props: Record<string, unknown> = {}) =>
    mount(ModDirectory, {
      shallow: true,
      props,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("initial render (before created() resolves)", () => {
    it("should render the mod-directory container", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.modDirectory).exists()).toBe(true);
    });

    it("should NOT render AppDropdownFileSelect while modpacks are loading", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.modDirectorySelect).exists()).toBe(false);
    });
  });

  describe("post-creation render (after created() resolves)", () => {
    it("should render AppDropdownFileSelect once modpacks have loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.modDirectorySelect).exists()).toBe(true);
    });

    it("should pass modpacks as options to AppDropdownFileSelect", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "AppDropdownFileSelect" })
          .props("options")
      ).toEqual([
        { text: "/path/to/modpack-a", value: "/path/to/modpack-a" },
        { text: "/path/to/modpack-b", value: "/path/to/modpack-b" },
      ]);
    });

    it("should pass current mod directory as currentSelection", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "AppDropdownFileSelect" })
          .props("currentSelection")
      ).toEqual({ text: "/path/to/modpack-a", value: "/path/to/modpack-a" });
    });

    it("should pass null as currentSelection when there is no current mod directory", async () => {
      mockModpackService.getModpackDirectory.mockResolvedValue(null);

      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "AppDropdownFileSelect" })
          .props("currentSelection")
      ).toBeNull();
    });
  });

  describe("label prop", () => {
    it("should pass the default label to BaseLabel", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent({ name: "BaseLabel" }).props("label")).toBe(
        "Wildlander installation folder"
      );
    });

    it("should pass a custom label prop to BaseLabel when provided", async () => {
      const wrapper = createWrapper({
        label: "Select your installation directory:",
      });
      await flushPromises();

      expect(wrapper.findComponent({ name: "BaseLabel" }).props("label")).toBe(
        "Select your installation directory:"
      );
    });
  });

  describe("created() — modpack list assembly", () => {
    it("should NOT duplicate current mod directory when it is already in the installed list", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const options = wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .props("options");

      const matchingEntries = options.filter(
        (o: { value: string }) => o.value === "/path/to/modpack-a"
      );
      expect(matchingEntries).toHaveLength(1);
    });

    it("should append current mod directory to options when it is NOT in the installed list", async () => {
      mockModpackService.getModpackDirectory.mockResolvedValue(
        "/path/to/unknown-modpack"
      );

      const wrapper = createWrapper();
      await flushPromises();

      const options = wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .props("options");

      expect(
        options.some(
          (o: { value: string }) => o.value === "/path/to/unknown-modpack"
        )
      ).toBe(true);
    });

    it("should only show installed modpacks when there is no current mod directory", async () => {
      mockModpackService.getModpackDirectory.mockResolvedValue(null);

      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "AppDropdownFileSelect" })
          .props("options")
      ).toEqual([
        { text: "/path/to/modpack-a", value: "/path/to/modpack-a" },
        { text: "/path/to/modpack-b", value: "/path/to/modpack-b" },
      ]);
    });
  });

  describe("modDirectorySet — valid directory", () => {
    it("should emit ENABLE_LOADING_EVENT when directory is valid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/new-modpack");
      await flushPromises();

      expect(mockEventService.emit).toHaveBeenCalledWith(ENABLE_LOADING_EVENT);
    });

    it("should invoke SET_MODPACK with the filepath when directory is valid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/new-modpack");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "SET_MODPACK",
        "/path/to/new-modpack"
      );
    });

    it("should update modDirectory to the new value when directory is valid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/new-modpack");
      await flushPromises();

      expect(
        wrapper
          .findComponent({ name: "AppDropdownFileSelect" })
          .props("currentSelection")
      ).toEqual({
        text: "/path/to/new-modpack",
        value: "/path/to/new-modpack",
      });
    });

    it("should invoke RELOAD when directory is valid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/new-modpack");
      await flushPromises();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("RELOAD");
    });
  });

  describe("modDirectorySet — invalid directory", () => {
    beforeEach(() => {
      mockModpackService.isModDirectoryValid.mockResolvedValue({
        ok: false,
        missingPaths: ["Data/missing-file.esp"],
      });
    });

    it("should NOT emit ENABLE_LOADING_EVENT when directory is invalid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/bad-modpack");
      await flushPromises();

      expect(mockEventService.emit).not.toHaveBeenCalledWith(
        ENABLE_LOADING_EVENT
      );
    });

    it("should NOT invoke SET_MODPACK when directory is invalid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/bad-modpack");
      await flushPromises();

      expect(mockIpcService.invoke).not.toHaveBeenCalledWith(
        "SET_MODPACK",
        expect.anything()
      );
    });

    it("should call messageService.error with title 'Invalid modpack directory selected' when directory is invalid", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/bad-modpack");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Invalid modpack directory selected",
        })
      );
    });
  });

  describe("triggerError — error message formatting", () => {
    it("should include missing paths in the error message when missingPaths is provided", async () => {
      mockModpackService.isModDirectoryValid.mockResolvedValue({
        ok: false,
        missingPaths: ["Data/file.esp", "Data/textures"],
      });

      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/bad-modpack");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Data/file.esp"),
        })
      );
    });

    it("should NOT include a missing paths section when missingPaths is undefined", async () => {
      mockModpackService.isModDirectoryValid.mockResolvedValue({ ok: false });

      const wrapper = createWrapper();
      await flushPromises();

      wrapper
        .findComponent({ name: "AppDropdownFileSelect" })
        .vm.$emit("file-selected", "/path/to/bad-modpack");
      await flushPromises();

      expect(mockMessageService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.not.stringContaining("Missing files/directories"),
        })
      );
    });
  });
});

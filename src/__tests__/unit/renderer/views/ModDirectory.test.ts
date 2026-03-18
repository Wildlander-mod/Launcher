import { flushPromises, mount } from "@vue/test-utils";
import ModDirectoryView from "@/renderer/src/views/ModDirectory.vue";
import { injectStrict } from "@/renderer/src/services/service-container";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

jest.mock("@/main/controllers/modpack/mopack.events", () => ({
  MODPACK_EVENTS: {
    GET_MODPACK_METADATA: "GET_MODPACK_METADATA",
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

const mockModpackMetadata = {
  name: "Wildlander",
  website: "https://www.wildlandermod.com",
  wiki: "https://wiki.wildlandermod.com/",
  patreon: "https://www.patreon.com/dylanbperry",
  roadmap: "https://airtable.com/shrvAxHcCeCqKfnGe",
};

describe("ModDirectoryView #renderer #view", () => {
  let mockIpcService: MockIpcService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIpcService = {
      invoke: jest.fn().mockImplementation((event: string) => {
        if (event === "GET_MODPACK_METADATA") {
          return Promise.resolve(mockModpackMetadata);
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
    mount(ModDirectoryView, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("initial render (before created() resolves)", () => {
    it("should NOT render AppModal while modpack metadata is loading", () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: "AppModal" }).exists()).toBe(false);
    });
  });

  describe("post-creation render (after created() resolves)", () => {
    it("should render AppModal once modpack metadata has loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent({ name: "AppModal" }).exists()).toBe(true);
    });

    it("should pass the modpack name as alt to BaseImage", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent({ name: "BaseImage" }).props("alt")).toBe(
        "Wildlander"
      );
    });

    it("should pass the correct label to ModDirectory component", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findComponent({ name: "ModDirectory" }).props("label")
      ).toBe("To get started, select your Wildlander installation directory:");
    });
  });
});

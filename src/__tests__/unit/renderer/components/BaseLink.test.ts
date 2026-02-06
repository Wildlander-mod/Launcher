import { mount } from "@vue/test-utils";
import BaseLink from "@/renderer/src/components/BaseLink.vue";
import { injectStrict } from "@/renderer/src/services/service-container";

jest.mock("@/renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

jest.mock("@/main/controllers/system/system.events", () => ({
  SYSTEM_EVENTS: {
    OPEN_LINK_IN_BROWSER: "OPEN_LINK_IN_BROWSER",
  },
}));

describe("BaseLink #renderer #component", () => {
  const selectors = {
    link: "a",
  };

  const mockIpcService = {
    invoke: jest.fn(),
  };

  const createWrapper = (props = {}, slots = {}) => {
    return mount(BaseLink, {
      shallow: true,
      props: {
        href: "https://example.com",
        ...props,
      },
      slots,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render link with href attribute", () => {
      const wrapper = createWrapper({ href: "https://test.com" });

      expect(wrapper.find(selectors.link).attributes("href")).toBe(
        "https://test.com"
      );
    });

    it("should render slot content", () => {
      const wrapper = createWrapper({}, { default: "Click me" });

      expect(wrapper.text()).toBe("Click me");
    });

    it("should apply underline class when underline prop is true", () => {
      const wrapper = createWrapper({ underline: true });

      expect(wrapper.classes()).toContain("c-link--underline");
    });

    it("should not apply underline class when underline prop is false", () => {
      const wrapper = createWrapper({ underline: false });

      expect(wrapper.classes()).not.toContain("c-link--underline");
    });

    it("should apply hover style class when hoverStyle prop is true", () => {
      const wrapper = createWrapper({ hoverStyle: true });

      expect(wrapper.classes()).toContain("c-link--underline-hover");
    });

    it("should not apply hover style class when hoverStyle prop is false", () => {
      const wrapper = createWrapper({ hoverStyle: false });

      expect(wrapper.classes()).not.toContain("c-link--underline-hover");
    });
  });

  describe("user interactions", () => {
    it("should open link in browser when clicked", async () => {
      const wrapper = createWrapper({ href: "https://example.com" });

      await wrapper.find(selectors.link).trigger("click");

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "OPEN_LINK_IN_BROWSER",
        "https://example.com"
      );
    });

    it("should prevent default link behavior when clicked", async () => {
      const wrapper = createWrapper();
      const event = new Event("click");
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");

      wrapper.find(selectors.link).element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});

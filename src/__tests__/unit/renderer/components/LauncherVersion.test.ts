import { mount } from "@vue/test-utils";
import LauncherVersion from "../../../../renderer/src/components/LauncherVersion.vue";
import BaseLink from "../../../../renderer/src/components/BaseLink.vue";
import { byTestId } from "../utils/test-utils";

const MockPopper = {
  name: "Popper",
  template: "<div><slot name='content' /><slot /></div>",
};

const selectors = {
  launcherVersion: byTestId("launcher-version"),
  warningIcon: ".c-launcher-version__warning",
};

describe("LauncherVersion #renderer #component", () => {
  describe("stable version rendering", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
      wrapper = mount(LauncherVersion, {
        shallow: true,
        props: { version: "2.6.2" },
        global: {
          stubs: { Popper: MockPopper },
          renderStubDefaultSlot: true,
        },
      });
    });

    it("should render the launcher version element", () => {
      expect(wrapper.find(selectors.launcherVersion).exists()).toBe(true);
    });

    it("should display the stable version text", () => {
      expect(wrapper.find(selectors.launcherVersion).text()).toContain("2.6.2");
    });

    it("should not render Popper when version is stable", () => {
      expect(wrapper.findComponent(MockPopper).exists()).toBe(false);
    });

    it("should not render BaseLink when version is stable", () => {
      expect(wrapper.findComponent(BaseLink).exists()).toBe(false);
    });

    it("should not render the warning icon when version is stable", () => {
      expect(wrapper.find(selectors.warningIcon).exists()).toBe(false);
    });
  });

  describe("null version rendering", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
      wrapper = mount(LauncherVersion, {
        shallow: true,
        props: { version: null },
        global: {
          stubs: { Popper: MockPopper },
          renderStubDefaultSlot: true,
        },
      });
    });

    it("should render the launcher version element when version is null", () => {
      expect(wrapper.find(selectors.launcherVersion).exists()).toBe(true);
    });

    it("should not render Popper when version is null", () => {
      expect(wrapper.findComponent(MockPopper).exists()).toBe(false);
    });

    it("should not render BaseLink when version is null", () => {
      expect(wrapper.findComponent(BaseLink).exists()).toBe(false);
    });

    it("should not render the warning icon when version is null", () => {
      expect(wrapper.find(selectors.warningIcon).exists()).toBe(false);
    });
  });

  describe("beta version rendering", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
      wrapper = mount(LauncherVersion, {
        shallow: true,
        props: { version: "2.7.0-beta.1" },
        global: {
          stubs: { Popper: MockPopper },
          renderStubDefaultSlot: true,
        },
      });
    });

    it("should render the launcher version element", () => {
      expect(wrapper.find(selectors.launcherVersion).exists()).toBe(true);
    });

    it("should display the beta version text", () => {
      expect(wrapper.find(selectors.launcherVersion).text()).toContain(
        "2.7.0-beta.1"
      );
    });

    it("should render Popper when version contains '-'", () => {
      expect(wrapper.findComponent(MockPopper).exists()).toBe(true);
    });

    it("should render BaseLink when version contains '-'", () => {
      expect(wrapper.findComponent(BaseLink).exists()).toBe(true);
    });

    it("should render the warning icon when version contains '-'", () => {
      expect(wrapper.find(selectors.warningIcon).exists()).toBe(true);
    });
  });
});

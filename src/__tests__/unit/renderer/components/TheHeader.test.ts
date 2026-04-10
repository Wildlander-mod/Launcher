import { mount } from "@vue/test-utils";
import TheHeader from "../../../../renderer/src/components/TheHeader.vue";
import type { Modpack } from "../../../../shared/types/modpack-metadata";
import { byTestId } from "../utils/test-utils";

const mockModpack: Modpack = {
  name: "Test Modpack",
  website: "https://test-website.com",
  wiki: "https://test-wiki.com",
  patreon: "https://test-patreon.com",
  roadmap: "https://test-roadmap.com",
};

let WildlanderModpack: Modpack;

jest.mock("../../../../shared/wildlander/modpack", () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  get WildlanderModpack() {
    return WildlanderModpack;
  },
}));

describe("TheHeader #renderer #component", () => {
  const selectors = {
    websiteLink: "website-link",
    wikiLink: "wiki-link",
    roadmapLink: "roadmap-link",
    patreonLink: "patreon-link",
  };

  const createWrapper = (modpackOverrides: Partial<Modpack> = {}) => {
    const modpack = { ...mockModpack };

    // Apply overrides and remove properties that are explicitly set to undefined
    Object.entries(modpackOverrides).forEach(([key, value]) => {
      if (value === undefined) {
        delete modpack[key as keyof Modpack];
      } else {
        modpack[key as keyof Modpack] = value as never;
      }
    });

    WildlanderModpack = modpack;

    return mount(TheHeader, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    WildlanderModpack = { ...mockModpack };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("logo rendering", () => {
    it("should render logo with correct props", () => {
      const wrapper = createWrapper();
      const logo = wrapper.findComponent({ name: "BaseImage" });

      expect(logo.props("imageSource")).toBe(
        "./images/logos/wildlander-full-light.svg"
      );
      expect(logo.props("alt")).toBe("Test Modpack");
      expect(logo.attributes("class")).toBe("c-header__image");
    });
  });

  describe("website link rendering", () => {
    it("should render website link when modpack.website exists", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(byTestId(selectors.websiteLink)).exists()).toBe(true);
    });

    it("should not render website link when modpack.website is undefined", () => {
      const wrapper = createWrapper({ website: undefined as never });

      expect(wrapper.find(byTestId(selectors.websiteLink)).exists()).toBe(
        false
      );
    });

    it("should pass correct href prop to website link", () => {
      const wrapper = createWrapper();
      const links = wrapper.findAllComponents({ name: "BaseLink" });
      const websiteLink = links.find(
        (link) => link.attributes("data-testid") === selectors.websiteLink
      );

      expect(websiteLink?.attributes("href")).toBe("https://test-website.com");
    });
  });

  describe("wiki link rendering", () => {
    it("should render wiki link when modpack.wiki exists", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(byTestId(selectors.wikiLink)).exists()).toBe(true);
    });

    it("should not render wiki link when modpack.wiki is undefined", () => {
      const wrapper = createWrapper({ wiki: undefined as never });

      expect(wrapper.find(byTestId(selectors.wikiLink)).exists()).toBe(false);
    });

    it("should pass correct href prop to wiki link", () => {
      const wrapper = createWrapper();
      const links = wrapper.findAllComponents({ name: "BaseLink" });
      const wikiLink = links.find(
        (link) => link.attributes("data-testid") === selectors.wikiLink
      );

      expect(wikiLink?.attributes("href")).toBe("https://test-wiki.com");
    });
  });

  describe("roadmap link rendering", () => {
    it("should render roadmap link when modpack.roadmap exists", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(byTestId(selectors.roadmapLink)).exists()).toBe(true);
    });

    it("should not render roadmap link when modpack.roadmap is undefined", () => {
      const wrapper = createWrapper({ roadmap: undefined as never });

      expect(wrapper.find(byTestId(selectors.roadmapLink)).exists()).toBe(
        false
      );
    });

    it("should pass correct href prop to roadmap link", () => {
      const wrapper = createWrapper();
      const links = wrapper.findAllComponents({ name: "BaseLink" });
      const roadmapLink = links.find(
        (link) => link.attributes("data-testid") === selectors.roadmapLink
      );

      expect(roadmapLink?.attributes("href")).toBe("https://test-roadmap.com");
    });
  });

  describe("patreon link rendering", () => {
    it("should render patreon link when modpack.patreon exists", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(byTestId(selectors.patreonLink)).exists()).toBe(true);
    });

    it("should not render patreon link when modpack.patreon is undefined", () => {
      const wrapper = createWrapper({ patreon: undefined as never });

      expect(wrapper.find(byTestId(selectors.patreonLink)).exists()).toBe(
        false
      );
    });

    it("should pass correct href prop to patreon link", () => {
      const wrapper = createWrapper();
      const links = wrapper.findAllComponents({ name: "BaseLink" });
      const patreonLink = links.find(
        (link) => link.attributes("data-testid") === selectors.patreonLink
      );

      expect(patreonLink?.attributes("href")).toBe("https://test-patreon.com");
    });
  });

  describe("link props", () => {
    it("should pass hoverStyle true to all links", () => {
      const wrapper = createWrapper();
      const links = wrapper.findAllComponents({ name: "BaseLink" });

      links.forEach((link) => {
        expect(link.props("hoverStyle")).toBe(true);
      });
    });

    it("should render website link with correct text", () => {
      const wrapper = createWrapper();
      const link = wrapper.find(byTestId(selectors.websiteLink));

      expect(link.text()).toBe("Website");
    });

    it("should render wiki link with correct text", () => {
      const wrapper = createWrapper();
      const link = wrapper.find(byTestId(selectors.wikiLink));

      expect(link.text()).toBe("Wiki");
    });

    it("should render roadmap link with correct text", () => {
      const wrapper = createWrapper();
      const link = wrapper.find(byTestId(selectors.roadmapLink));

      expect(link.text()).toBe("Roadmap");
    });

    it("should render patreon link with correct text", () => {
      const wrapper = createWrapper();
      const link = wrapper.find(byTestId(selectors.patreonLink));

      expect(link.text()).toBe("Patreon");
    });
  });
});

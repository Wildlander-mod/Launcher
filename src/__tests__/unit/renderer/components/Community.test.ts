import { mount } from "@vue/test-utils";
import Community from "../../../../renderer/src/components/Community.vue";

const createWrapper = () =>
  mount(Community, {
    shallow: true,
    global: {
      renderStubDefaultSlot: true,
    },
  });

const communityLinks = [
  {
    label: "YouTube",
    index: 0,
    href: "https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww",
    imageSource: "./images/logos/youtube.svg",
  },
  {
    label: "Twitch",
    index: 1,
    href: "https://www.twitch.tv/dylanbperry",
    imageSource: "./images/logos/twitch.svg",
  },
  {
    label: "Discord",
    index: 2,
    href: "https://discord.gg/8VkDrfq",
    imageSource: "./images/logos/discord.svg",
  },
  {
    label: "Reddit",
    index: 3,
    href: "https://reddit.com/r/wildlander",
    imageSource: "./images/logos/reddit.svg",
  },
];

describe("Community #renderer #component", () => {
  describe("rendering", () => {
    it("should render four BaseLink components", () => {
      const wrapper = createWrapper();

      expect(wrapper.findAllComponents({ name: "BaseLink" })).toHaveLength(4);
    });

    it("should render four ImageWithText components", () => {
      const wrapper = createWrapper();

      expect(wrapper.findAllComponents({ name: "ImageWithText" })).toHaveLength(
        4
      );
    });

    communityLinks.forEach(({ label, index, href, imageSource }) => {
      it(`should render the ${label} link with the correct href`, () => {
        const wrapper = createWrapper();

        expect(
          wrapper.findAllComponents({ name: "BaseLink" })[index]?.props("href")
        ).toBe(href);
      });

      it(`should render the ${label} ImageWithText with the correct image-source`, () => {
        const wrapper = createWrapper();

        expect(
          wrapper
            .findAllComponents({ name: "ImageWithText" })
            [index]?.props("imageSource")
        ).toBe(imageSource);
      });

      it(`should render the ${label} ImageWithText with the correct text`, () => {
        const wrapper = createWrapper();

        expect(
          wrapper
            .findAllComponents({ name: "ImageWithText" })
            [index]?.props("text")
        ).toBe(label);
      });
    });
  });
});

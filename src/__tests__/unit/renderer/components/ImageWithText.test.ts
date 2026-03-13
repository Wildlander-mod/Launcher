import { mount } from "@vue/test-utils";
import ImageWithText from "@/renderer/src/components/ImageWithText.vue";
import BaseImage from "@/renderer/src/components/BaseImage.vue";

const selectors = {
  text: ".c-svg-with-text__text",
};

const defaultProps = {
  imageSource: "/path/to/image.png",
  alt: "Test image",
  text: "Hello World",
};

describe("ImageWithText #renderer #component", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(ImageWithText, {
      shallow: true,
      props: defaultProps,
      global: {
        renderStubDefaultSlot: true,
      },
    });
  });

  it("should render the text prop", () => {
    expect(wrapper.find(selectors.text).text()).toBe("Hello World");
  });

  it("should pass the correct props to BaseImage", () => {
    expect(wrapper.findComponent(BaseImage).props()).toEqual({
      imageSource: "/path/to/image.png",
      alt: "Test image",
      height: 50,
      width: 50,
    });
  });
});

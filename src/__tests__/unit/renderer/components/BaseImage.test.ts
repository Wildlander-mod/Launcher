import { mount } from "@vue/test-utils";
import BaseImage from "@/renderer/src/components/BaseImage.vue";

describe("BaseImage component #renderer #component", () => {
  it("should render image with all props correctly bound to attributes", () => {
    const wrapper = mount(BaseImage, {
      shallow: true,
      props: {
        imageSource: "https://example.com/image.png",
        alt: "Test image",
        height: 200,
        width: 300,
      },
    });

    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://example.com/image.png");
    expect(img.attributes("alt")).toBe("Test image");
    expect(img.attributes("height")).toBe("200");
    expect(img.attributes("width")).toBe("300");
  });

  it("should not render height and width attributes when not provided", () => {
    const wrapper = mount(BaseImage, {
      shallow: true,
      props: {
        imageSource: "https://example.com/image.png",
        alt: "Test image",
      },
    });

    const img = wrapper.find("img");
    expect(img.attributes("height")).toBeUndefined();
    expect(img.attributes("width")).toBeUndefined();
  });
});

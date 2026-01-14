import { mount, VueWrapper } from "@vue/test-utils";
import App from "@/renderer/src/App.vue";
import TheTitleBar from "@/renderer/src/components/TheTitleBar.vue";
import AppPage from "@/renderer/src/components/AppPage.vue";
import { byTestId } from "./utils/test-utils";

describe("App.vue", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(App, { shallow: true });
  });

  it("applies background image style correctly", () => {
    const appElement = wrapper.find(byTestId("app"));

    expect(appElement.exists()).toBe(true);

    expect(appElement.attributes("style")).toContain(
      "background-image: url(/images/default-background.png)"
    );
  });

  it("renders TheTitleBar component", () => {
    const titleBarComponent = wrapper.findComponent(TheTitleBar);

    expect(titleBarComponent.exists()).toBe(true);
  });

  it("renders AppPage component", () => {
    const appPageComponent = wrapper.findComponent(AppPage);

    expect(appPageComponent.exists()).toBe(true);
  });
});

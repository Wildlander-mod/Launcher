import { mocked } from "ts-jest/utils";
import type { VueWrapper } from "@vue/test-utils";
import { mount } from "@vue/test-utils";
import AppPage from "@/renderer/src/components/AppPage.vue";
import TheNavigation from "@/renderer/src/components/TheNavigation.vue";
import { byTestId } from "@/__tests__/unit/renderer/utils/test-utils";
import { injectStrict } from "@/renderer/src/services/service-container";
import { reactive } from "vue";
import { type RouteLocationNormalizedLoaded, useRoute } from "vue-router";
import { createMockEventService } from "@/__tests__/unit/renderer/utils/mock-event-service";
import { modalOpenedEvent } from "@/renderer/src/services/modal.service";
import {
  DISABLE_LOADING_EVENT,
  ENABLE_LOADING_EVENT,
} from "@/renderer/src/services/event.service";

jest.mock("vue-router");
const mockUseRoute = mocked(useRoute);

jest.mock("@/renderer/src/services/service-container");
const mockInjectStrict = mocked(injectStrict);

describe("AppPage", () => {
  let wrapper: VueWrapper;
  let mockEventService: ReturnType<typeof createMockEventService>;
  let cursorSpy: jest.SpyInstance;
  let mockRoute: RouteLocationNormalizedLoaded;

  const selectors = {
    main: byTestId("app-page"),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRoute = reactive({
      name: "home",
      meta: {},
      fullPath: "",
      hash: "",
      matched: [],
      params: {},
      path: "",
      query: {},
      redirectedFrom: undefined,
    } satisfies RouteLocationNormalizedLoaded);

    mockUseRoute.mockReturnValue(mockRoute);

    mockEventService = createMockEventService();
    mockInjectStrict.mockReturnValue(mockEventService);

    // Setup document.body.style.cursor spy
    cursorSpy = jest.spyOn(document.body.style, "cursor", "set");

    wrapper = mount(AppPage, {
      shallow: true,
      global: {
        stubs: {
          "router-view": true,
        },
        renderStubDefaultSlot: true,
      },
    });
  });

  afterEach(() => {
    cursorSpy.mockRestore();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe("Initial navigation rendering", () => {
    it("should render TheNavigation when preloadRoute is false", async () => {
      mockRoute.name = "settings";
      mockRoute.meta.preload = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(true);
    });

    it("should hide TheNavigation when preloadRoute is true", async () => {
      mockRoute.name = "preload";
      mockRoute.meta.preload = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(false);
    });
  });

  describe("Route metadata watching", () => {
    it("should update preloadRoute when route metadata changes to true", async () => {
      mockRoute.name = "preload";
      mockRoute.meta.preload = true;

      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(false);
    });

    it("should update preloadRoute when route metadata changes to false", async () => {
      mockRoute.name = "settings";
      mockRoute.meta.preload = false;

      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(true);
    });

    it("should handle route with undefined meta", async () => {
      mockRoute.name = "no-meta";
      delete (mockRoute as { meta?: unknown }).meta;

      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(true);
    });

    it("should update navigation visibility when route changes", async () => {
      mockRoute.name = "settings";
      mockRoute.meta.preload = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(true);

      mockRoute.name = "preload";
      mockRoute.meta.preload = true;

      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(TheNavigation).exists()).toBe(false);
    });
  });

  describe("CSS class toggling", () => {
    it("should allow click events when modal is closed", () => {
      expect(wrapper.find(selectors.main).classes()).not.toContain(
        "u-disable-click-events"
      );
    });

    it("should disable click events when modal is opened", async () => {
      mockEventService.trigger(modalOpenedEvent, true);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).toContain(
        "u-disable-click-events"
      );
    });
  });

  describe("Modal event handling", () => {
    it("should disable click events when modalOpenedEvent emits true", async () => {
      mockEventService.trigger(modalOpenedEvent, true);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).toContain(
        "u-disable-click-events"
      );
    });

    it("should enable click events when modalOpenedEvent emits false", async () => {
      mockEventService.trigger(modalOpenedEvent, true);
      await wrapper.vm.$nextTick();

      mockEventService.trigger(modalOpenedEvent, false);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).not.toContain(
        "u-disable-click-events"
      );
    });
  });

  describe("ENABLE_LOADING_EVENT handling", () => {
    it("should disable click events when loading enabled", async () => {
      mockEventService.trigger(ENABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).toContain(
        "u-disable-click-events"
      );
    });

    it("should change cursor to progress when loading enabled", async () => {
      mockEventService.trigger(ENABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      expect(cursorSpy).toHaveBeenCalledWith("progress");
    });

    it("should disable click events and change cursor when loading enabled", async () => {
      mockEventService.trigger(ENABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).toContain(
        "u-disable-click-events"
      );
      expect(cursorSpy).toHaveBeenCalledWith("progress");
    });
  });

  describe("DISABLE_LOADING_EVENT handling", () => {
    it("should enable click events when loading disabled", async () => {
      mockEventService.trigger(ENABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      mockEventService.trigger(DISABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).not.toContain(
        "u-disable-click-events"
      );
    });

    it("should change cursor to default when loading disabled", async () => {
      mockEventService.trigger(ENABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      mockEventService.trigger(DISABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      expect(cursorSpy).toHaveBeenCalledWith("default");
    });

    it("should enable click events and change cursor when loading disabled", async () => {
      mockEventService.trigger(ENABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      mockEventService.trigger(DISABLE_LOADING_EVENT);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.main).classes()).not.toContain(
        "u-disable-click-events"
      );
      expect(cursorSpy).toHaveBeenCalledWith("default");
    });
  });

  describe("Event service integration", () => {
    it("should register modalOpened listener in created hook", () => {
      expect(mockEventService.on).toHaveBeenCalledWith(
        modalOpenedEvent,
        expect.any(Function)
      );
    });

    it("should register ENABLE_LOADING_EVENT listener in created hook", () => {
      expect(mockEventService.on).toHaveBeenCalledWith(
        ENABLE_LOADING_EVENT,
        expect.any(Function)
      );
    });

    it("should register DISABLE_LOADING_EVENT listener in created hook", () => {
      expect(mockEventService.on).toHaveBeenCalledWith(
        DISABLE_LOADING_EVENT,
        expect.any(Function)
      );
    });
  });
});

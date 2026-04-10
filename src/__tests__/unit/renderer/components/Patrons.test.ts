import { flushPromises, mount } from "@vue/test-utils";
import Patrons from "../../../../renderer/src/components/Patrons.vue";
import { injectStrict } from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";
import type { Patron } from "../../../../renderer/src/services/patreon.service";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    PATRON_SERVICE: Symbol("PATRON_SERVICE"),
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

const selectors = {
  patronsContainer: byTestId("patrons-container"),
  superPatronsList: byTestId("super-patrons-list"),
  patronsList: byTestId("patrons-list"),
  patronsError: byTestId("patrons-error"),
};

const mockPatrons: Patron[] = [
  { name: "Alice", tier: "Super Patron" },
  { name: "Bob", tier: "Super Patron" },
  { name: "Charlie", tier: "Patron" },
  { name: "Diana", tier: "Patron" },
];

describe("Patrons #renderer #component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockInjectStrict.mockReturnValue({
      getPatrons: jest.fn().mockResolvedValue(mockPatrons),
    });
  });

  const createWrapper = () =>
    mount(Patrons, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("before patrons load", () => {
    it("should not render the super patrons list before patrons load", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.superPatronsList).exists()).toBe(false);
    });

    it("should not render the patrons list before patrons load", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.patronsList).exists()).toBe(false);
    });

    it("should not render the error message before patrons load", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.patronsError).exists()).toBe(false);
    });
  });

  describe("when patrons load successfully", () => {
    it("should render the super patrons list when super patrons are present", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.superPatronsList).exists()).toBe(true);
    });

    it("should render the patrons list when other patrons are present", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsList).exists()).toBe(true);
    });

    it("should not render the error message when patrons load successfully", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsError).exists()).toBe(false);
    });

    it("should pass only super patrons to the super patrons BaseList", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findAllComponents({ name: "BaseList" })[0]?.props("items")
      ).toEqual(["Alice", "Bob"]);
    });

    it("should pass only other patrons to the patrons BaseList", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findAllComponents({ name: "BaseList" })[1]?.props("items")
      ).toEqual(["Charlie", "Diana"]);
    });
  });

  describe("when only super patrons are present", () => {
    beforeEach(() => {
      mockInjectStrict.mockReturnValue({
        getPatrons: jest
          .fn()
          .mockResolvedValue([{ name: "Alice", tier: "Super Patron" }]),
      });
    });

    it("should render the super patrons list", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.superPatronsList).exists()).toBe(true);
    });

    it("should not render the patrons list when there are no other patrons", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsList).exists()).toBe(false);
    });
  });

  describe("when only other patrons are present", () => {
    beforeEach(() => {
      mockInjectStrict.mockReturnValue({
        getPatrons: jest
          .fn()
          .mockResolvedValue([{ name: "Charlie", tier: "Patron" }]),
      });
    });

    it("should not render the super patrons list when there are no super patrons", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.superPatronsList).exists()).toBe(false);
    });

    it("should render the patrons list", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsList).exists()).toBe(true);
    });
  });

  describe("when patrons load successfully but array is empty", () => {
    beforeEach(() => {
      mockInjectStrict.mockReturnValue({
        getPatrons: jest.fn().mockResolvedValue([]),
      });
    });

    it("should not render the super patrons list when patrons array is empty", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.superPatronsList).exists()).toBe(false);
    });

    it("should not render the patrons list when patrons array is empty", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsList).exists()).toBe(false);
    });

    it("should not render the error message when patrons array is empty and no error occurred", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsError).exists()).toBe(false);
    });
  });

  describe("when patrons fail to load", () => {
    beforeEach(() => {
      mockInjectStrict.mockReturnValue({
        getPatrons: jest.fn().mockRejectedValue(new Error("Failed to fetch")),
      });
    });

    it("should render the error message when getPatrons throws", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsError).exists()).toBe(true);
    });

    it("should not render the super patrons list when getPatrons throws", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.superPatronsList).exists()).toBe(false);
    });

    it("should not render the patrons list when getPatrons throws", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.patronsList).exists()).toBe(false);
    });
  });
});

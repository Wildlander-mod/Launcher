import { mount, VueWrapper } from "@vue/test-utils";
import AppModal from "../../../renderer/src/components/AppModal.vue";
import { injectStrict } from "../../../renderer/src/services/service-container";
import { byTestId } from "./utils/test-utils";

jest.mock("../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    MODAL_SERVICE: Symbol("MODAL_SERVICE"),
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

interface VueFinalModal {
  open: (name: string) => void;
  close: (name: string) => void;
}

interface MockModalService {
  openModal: jest.MockedFunction<(name: string, vfm: VueFinalModal) => void>;
  closeModal: jest.MockedFunction<(name: string, vfm: VueFinalModal) => void>;
}

const mockVfm: VueFinalModal = {
  open: jest.fn(),
  close: jest.fn(),
};

const SELECTORS = {
  MODAL_CLOSE_BUTTON: "modal-close-button-container",
  MODAL_ACTION_SLOT_CONTAINER: "modal-action-slot-container",
  TEST_CONTENT: "test-content",
  TEST_ACTION: "test-action",
} as const;

const mountOptions = {
  shallow: true,
  global: {
    provide: {
      $vfm: mockVfm,
    },
    stubs: {
      "vue-final-modal": true,
    },
    renderStubDefaultSlot: true,
  },
};

describe("AppModal.vue", () => {
  let wrapper: VueWrapper;
  let mockModalService: MockModalService;
  let defaultProps: {
    name: string;
    showModal: boolean;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    defaultProps = {
      name: "test-modal",
      showModal: true,
    };

    mockModalService = {
      openModal: jest.fn(),
      closeModal: jest.fn(),
    };

    mockInjectStrict.mockReturnValue(mockModalService);

    wrapper = mount(AppModal, {
      props: defaultProps,
      ...mountOptions,
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe("Component Initialization", () => {
    it("mounts successfully with required props", () => {
      expect(wrapper.exists()).toBe(true);
    });

    it("opens modal on mount when showModal is true", () => {
      expect(mockModalService.openModal).toHaveBeenCalledWith(
        "test-modal",
        mockVfm
      );
    });

    it("does not open modal on mount when showModal is false", () => {
      wrapper = mount(AppModal, {
        props: { ...defaultProps, showModal: false },
        ...mountOptions,
      });

      expect(mockModalService.closeModal).toHaveBeenCalledWith(
        "test-modal",
        mockVfm
      );
    });

    it("uses default value for showModal prop when not provided", () => {
      wrapper = mount(AppModal, {
        props: { name: "test-modal" },
        ...mountOptions,
      });

      expect(mockModalService.openModal).toHaveBeenCalledWith(
        "test-modal",
        mockVfm
      );
    });
  });

  describe("Modal Toggle", () => {
    beforeEach(() => {
      wrapper = mount(AppModal, {
        props: defaultProps,
        ...mountOptions,
      });
      jest.clearAllMocks();
    });

    it("opens modal when showModal prop changes to true", async () => {
      await wrapper.setProps({ showModal: false });
      jest.clearAllMocks();

      await wrapper.setProps({ showModal: true });

      expect(mockModalService.openModal).toHaveBeenCalledWith(
        "test-modal",
        mockVfm
      );
    });

    it("closes modal when showModal prop changes to false", async () => {
      await wrapper.setProps({ showModal: true });
      jest.clearAllMocks();

      await wrapper.setProps({ showModal: false });

      expect(mockModalService.closeModal).toHaveBeenCalledWith(
        "test-modal",
        mockVfm
      );
    });
  });

  describe("Close Button", () => {
    it("does not render close button when includeCloseButton is false", () => {
      wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          includeCloseButton: false,
        },
        ...mountOptions,
      });

      const closeButton = wrapper.find(byTestId(SELECTORS.MODAL_CLOSE_BUTTON));
      expect(closeButton.exists()).toBe(false);
    });

    it("renders close button when includeCloseButton is true", () => {
      wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          includeCloseButton: true,
        },
        ...mountOptions,
      });

      const closeButton = wrapper.find(byTestId(SELECTORS.MODAL_CLOSE_BUTTON));
      expect(closeButton.exists()).toBe(true);
    });

    it("closes modal when close button is clicked", async () => {
      wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          includeCloseButton: true,
        },
        ...mountOptions,
      });

      jest.clearAllMocks();

      const closeButton = wrapper.find(byTestId(SELECTORS.MODAL_CLOSE_BUTTON));
      const button = closeButton.findComponent({ name: "BaseButton" });
      await button.trigger("click");

      expect(mockModalService.closeModal).toHaveBeenCalledWith(
        "test-modal",
        mockVfm
      );
    });

    it("uses default value for includeCloseButton prop when not provided", () => {
      const closeButton = wrapper.find(byTestId(SELECTORS.MODAL_CLOSE_BUTTON));
      expect(closeButton.exists()).toBe(false);
    });
  });

  describe("Slots", () => {
    it("renders default slot content text correctly", () => {
      wrapper = mount(AppModal, {
        props: defaultProps,
        slots: {
          default: "<div data-testid='test-content'>Test Content</div>",
        },
        ...mountOptions,
      });

      expect(wrapper.find(byTestId(SELECTORS.TEST_CONTENT)).text()).toBe(
        "Test Content"
      );
    });

    it("renders action slot content when provided", () => {
      wrapper = mount(AppModal, {
        props: defaultProps,
        slots: {
          action: "<button data-testid='test-action'>Test Action</button>",
        },
        ...mountOptions,
      });

      const actionSlot = wrapper.find(
        byTestId(SELECTORS.MODAL_ACTION_SLOT_CONTAINER)
      );
      expect(actionSlot.find(byTestId(SELECTORS.TEST_ACTION)).exists()).toBe(
        true
      );
    });

    it("does not render action slot container when action slot is not provided", () => {
      const actionSlot = wrapper.find(
        byTestId(SELECTORS.MODAL_ACTION_SLOT_CONTAINER)
      );
      expect(actionSlot.exists()).toBe(false);
    });
  });
});

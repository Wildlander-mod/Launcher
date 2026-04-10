import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import AppDropdownFileSelect from "../../../renderer/src/components/AppDropdownFileSelect.vue";
import BaseDropdown from "../../../renderer/src/components/BaseDropdown.vue";
import { DIALOG_EVENTS } from "../../../main/controllers/dialog/dialog.events";
import { injectStrict } from "../../../renderer/src/services/service-container";

jest.mock("../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    IPC_SERVICE: Symbol("IPC_SERVICE"),
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

jest.mock("../../../main/controllers/dialog/dialog.events", () => ({
  DIALOG_EVENTS: {
    DIRECTORY_SELECT: "DIRECTORY_SELECT",
  },
}));

interface MockIpcService {
  invoke: jest.MockedFunction<(event: string) => Promise<unknown>>;
}

// Note: We cannot import types or consts from vue components except for the component itself.
// Vue test utils cannot work with class based components.
// TODO remove this once vue3 composition api is implemented for this component.
const optionSelectedEvent = "file-selected";

// Note: We cannot infer the type of BaseDropdown's props, so we need to define it explicitly here.
// Vue test utils cannot work with class based components.
// TODO remove this once vue3 composition api is implemented for this component.
interface SelectOption {
  text: string;
  value: unknown;
  disabled?: boolean;
  hidden?: boolean;
}

// Note: vue test utils cannot infer the type of BaseDropdown's props, so we need to define it explicitly here.
// Vue test utils cannot work with class based components.
// TODO remove this once vue3 composition api is implemented for this component.
interface BaseDropdownProps {
  options: SelectOption[];
  currentSelection: SelectOption;
  grow?: string;
  small?: boolean;
}

describe("AppDropdownFileSelect.vue", () => {
  let wrapper: VueWrapper;
  let mockIpcService: MockIpcService;
  let defaultProps: {
    options: SelectOption[];
    defaultText: string;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    defaultProps = {
      options: [
        { text: "Option 1", value: "/path/option1" },
        { text: "Option 2", value: "/path/option2" },
      ],
      defaultText: "Mock default text",
    };

    mockIpcService = {
      invoke: jest.fn(),
    };

    mockInjectStrict.mockReturnValue(mockIpcService);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe("Component Initialization", () => {
    beforeEach(() => {
      wrapper = mount(AppDropdownFileSelect, {
        props: defaultProps,
        shallow: true,
      });
    });

    it("mounts successfully with required props", () => {
      expect(wrapper.exists()).toBe(true);
    });

    it("adds 'Choose another folder...' option when existing options are provided", () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      const options = props.options;

      expect(options).toHaveLength(4); // 2 options + 1 default text + 1 choose another folder option
      expect(options[3]).toEqual({
        text: "Choose another folder...",
        value: "SELECT_ANOTHER_FILE",
      });
    });

    it("adds 'Select folder...' option when no existing options are provided", () => {
      const propsWithEmptyOptions = {
        ...defaultProps,
        options: [],
      };

      wrapper = mount(AppDropdownFileSelect, {
        props: propsWithEmptyOptions,
        shallow: true,
      });

      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      const options = props.options;

      expect(options[1]).toEqual({
        text: "Select folder...",
        value: "SELECT_ANOTHER_FILE",
      });
    });

    it("adds default text option when no current selection is provided", () => {
      wrapper = mount(AppDropdownFileSelect, {
        props: {
          ...defaultProps,
          currentSelection: null,
        },
        shallow: true,
      });

      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      const options = props.options;

      expect(options[0]).toEqual({
        text: "Mock default text",
        value: null,
        disabled: true,
        hidden: true,
      });
    });
  });

  describe("Option Selection", () => {
    beforeEach(() => {
      wrapper = mount(AppDropdownFileSelect, {
        props: defaultProps,
        shallow: true,
      });
    });

    it("emits file-selected event with option value for regular options", () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const testOption: SelectOption = {
        text: "Test Option",
        value: "/test/path",
      };

      baseDropdown.vm.$emit("selected", testOption);

      expect(wrapper.emitted(optionSelectedEvent)).toBeTruthy();
      expect(wrapper.emitted(optionSelectedEvent)?.[0]).toEqual(["/test/path"]);
    });

    it("calls IPC service for directory selection when SELECT_ANOTHER_FILE is selected", () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const selectAnotherOption: SelectOption = {
        text: "Choose another folder...",
        value: "SELECT_ANOTHER_FILE",
      };

      mockIpcService.invoke.mockResolvedValue({
        canceled: false,
        filePaths: ["/selected/directory"],
      });

      baseDropdown.vm.$emit("selected", selectAnotherOption);

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        DIALOG_EVENTS.DIRECTORY_SELECT
      );
    });

    it("emits file-selected event with dialog result when directory is selected", async () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const selectAnotherOption: SelectOption = {
        text: "Choose another folder...",
        value: "SELECT_ANOTHER_FILE",
      };

      mockIpcService.invoke.mockResolvedValue({
        canceled: false,
        filePaths: ["/selected/directory"],
      });

      baseDropdown.vm.$emit("selected", selectAnotherOption);
      await flushPromises();

      expect(wrapper.emitted(optionSelectedEvent)).toBeTruthy();
      expect(wrapper.emitted(optionSelectedEvent)?.[0]).toEqual([
        "/selected/directory",
      ]);
    });

    it("does not emit file-selected event when dialog is canceled", async () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const selectAnotherOption: SelectOption = {
        text: "Choose another folder...",
        value: "SELECT_ANOTHER_FILE",
      };

      mockIpcService.invoke.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      baseDropdown.vm.$emit("selected", selectAnotherOption);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted(optionSelectedEvent)).toBeFalsy();
    });
  });

  describe("Props Handling", () => {
    beforeEach(() => {
      wrapper = mount(AppDropdownFileSelect, {
        props: defaultProps,
        shallow: true,
      });
    });

    it("passes current selection to BaseDropdown when provided", () => {
      const currentSelection: SelectOption = {
        text: "Current",
        value: "/current",
      };

      wrapper = mount(AppDropdownFileSelect, {
        props: {
          ...defaultProps,
          currentSelection,
        },
        shallow: true,
      });

      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      expect(props.currentSelection).toEqual(currentSelection);
    });

    it("uses first option as current selection when none provided", () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      expect(props.currentSelection).toEqual(defaultProps.options[0]);
    });

    it("passes other props to BaseDropdown correctly", () => {
      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      expect(props.grow).toBe("true");
      expect(props.small).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      wrapper = mount(AppDropdownFileSelect, {
        props: defaultProps,
        shallow: true,
      });
    });

    it("handles empty options array correctly", () => {
      wrapper = mount(AppDropdownFileSelect, {
        props: {
          ...defaultProps,
          options: [],
        },
        shallow: true,
      });

      const baseDropdown = wrapper.findComponent(BaseDropdown);
      const props = baseDropdown.props() as BaseDropdownProps;
      const options = props.options;

      expect(options).toHaveLength(2); // default text + select folder
      expect(options[1]?.text).toBe("Select folder...");
    });
  });
});

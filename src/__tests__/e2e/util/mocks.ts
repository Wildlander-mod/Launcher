import type { ProcessWithGlobals } from "../../../main/types/process-globals";
import type { LauncherApplication } from "../../../main/application";
import type { ElectronApplication, JSHandle } from "playwright";
import { ChildProcessBinding } from "../../../main/bindings/child-process.binding";
import type psList from "ps-list";
import type { ProcessDescriptor } from "ps-list";
import { PsListBinding } from "../../../main/bindings/psList.binding";
import {
  ProcessKill,
  ProcessKillBinding,
} from "../../../main/bindings/process-kill.binding";
import { ConfigBinding } from "../../../main/bindings/config.binding";
import type { Resolution } from "../../../shared/types/Resolution";
import type child_process from "child_process";

/**
 * Mocks the dialog.showErrorBox method in Electron
 * @param electronApp - The Electron application instance from Playwright
 * @returns A JSHandle to a function that returns the error dialog arguments
 */
export const mockErrorDialog = async (
  electronApp: ElectronApplication
): Promise<
  JSHandle<() => { title: string; content: string; dialogShown: boolean }>
> => {
  return electronApp.evaluateHandle(({ dialog }) => {
    let title = "";
    let content = "";
    let dialogShown = false;

    // Override showErrorBox method to capture dialog arguments
    dialog.showErrorBox = (dialogTitle, dialogContent) => {
      title = dialogTitle;
      content = dialogContent;
      dialogShown = true;
    };

    // Return a function to retrieve the captured dialog arguments later
    return () => ({
      title,
      content,
      dialogShown,
    });
  });
};

/**
 * Mocks the dialog.showMessageBox method in Electron
 * @param electronApp - The Electron application instance from Playwright
 * @param responseNumber - Optional response number to return (defaults to 0)
 * @returns A JSHandle to a function that returns the message box arguments
 */
export const mockMessageBox = async (
  electronApp: ElectronApplication,
  responseNumber = 0
): Promise<
  JSHandle<
    () => {
      messageBoxShown: boolean;
      messageBoxTitle: string;
      messageBoxMessage: string;
    }
  >
> => {
  return electronApp.evaluateHandle(({ dialog }, response) => {
    let messageBoxShown = false;
    let messageBoxTitle = "";
    let messageBoxMessage = "";

    // Override showMessageBox method to capture dialog arguments
    dialog.showMessageBox = (options) => {
      messageBoxShown = true;
      messageBoxTitle = options.title ?? "";
      messageBoxMessage =
        options && "message" in options ? options.message ?? "" : "";
      return Promise.resolve({ response, checkboxChecked: false });
    };

    // Return a function to retrieve the captured dialog arguments later
    return () => ({
      messageBoxShown,
      messageBoxTitle,
      messageBoxMessage,
    });
  }, responseNumber);
};

/**
 * Mocks the psList function in the IoC container
 * @param electronApp The electron application
 * @param mockProcessList Optional list of processes to be returned
 * @returns A handle to access the mock function's arguments
 */
export async function replacePsListWithMock(
  electronApp: ElectronApplication,
  mockProcessList: ProcessDescriptor[] = []
) {
  return electronApp.evaluateHandle(
    ({}, { psListBinding, mockProcesses }) => {
      const processGlobals = (process as ProcessWithGlobals)._globals_;

      let calls = 0;
      let lastCalledWith: unknown[] | undefined;

      const mockPsList: typeof psList = (...args: unknown[]) => {
        calls++;
        lastCalledWith = args;
        return Promise.resolve(mockProcesses);
      };

      // The psList method is `promisified` by default, so we need to override the custom method to use our mock
      (mockPsList as unknown as Record<symbol, unknown>)[
        processGlobals.promisifyCustomSymbol
      ] = mockPsList;

      // Replace the binding with our mock
      (processGlobals.launcherApplication as LauncherApplication)
        .bind(psListBinding)
        .to(mockPsList);

      // Return a function that provides access to the mock's state
      return () => ({
        calls,
        lastCalledWith,
      });
    },
    { psListBinding: PsListBinding.toString(), mockProcesses: mockProcessList }
  );
}

/**
 * Mocks the process.kill function in the IoC container
 * @param electronApp The electron application
 * @returns A handle to access the mock function's arguments
 */
export async function mockProcessKill(electronApp: ElectronApplication) {
  return electronApp.evaluateHandle(({}, processKillBinding) => {
    const processGlobals = (process as ProcessWithGlobals)._globals_;

    let calls = 0;
    let lastCalledWith: { pid: number; signal?: string | number } | undefined;
    const allCalledWith: { pid: number; signal?: string | number }[] = [];

    // Create a mock process.kill function that records what it was called with
    const mockKill: ProcessKill = (pid, signal) => {
      calls++;
      lastCalledWith = signal !== undefined ? { pid, signal } : { pid };
      allCalledWith.push(signal !== undefined ? { pid, signal } : { pid });
      return true; // process.kill returns true if the process exists
    };

    // Replace the binding with our mock
    (processGlobals.launcherApplication as LauncherApplication)
      .bind(processKillBinding)
      .to(mockKill);

    // Return a function that provides access to the mock's state
    return () => ({
      calls,
      lastCalledWith,
      allCalledWith,
    });
  }, ProcessKillBinding.toString());
}

/**
 * Creates a mock for the child process exec method that allows manual resolution
 * @param electronApp - The Electron application instance from Playwright
 * @returns A JSHandle to functions that allow controlling the exec promise
 * @example
 * ```js
 *    const execHandle = await replaceChildProcessExecWithMock(electronApp);
 *    await execHandle.evaluate(handle => handle.resolveExec());
 *    const command = await execHandle.evaluate(handle => handle.getCommand());
 * ```
 */
export const replaceChildProcessExecWithMock = async (
  electronApp: ElectronApplication
): Promise<
  JSHandle<{
    /**
     * @returns The command that was passed to the exec method
     * @example `await execHandle.evaluate(handle => handle.getCommand());`
     */
    getCommand: () => string;
    /**
     * Resolves the exec promise with a default value
     * @example `await execHandle.evaluate(handle => handle.resolveExec());`
     */
    resolveExec: () => Promise<void>;
    /**
     * Rejects the exec promise with the given error message
     * @example `await execHandle.evaluate(handle => handle.rejectExec("error message"));`
     */
    rejectExec: (errorMessage: string) => Promise<void>;
    /**
     * @returns A promise that resolves when the exec method has been called
     * @example `await execHandle.evaluate(handle => handle.waitForExec());`
     */
    waitForExec: () => Promise<void>;
  }>
> => {
  return electronApp.evaluateHandle(async ({}, childProcessBinding) => {
    const processGlobals = (process as ProcessWithGlobals)._globals_;

    let command: string;
    let resolvePromise: (value: { stdout: string; stderr: string }) => void;
    let rejectPromise: (error: Error) => void;
    const waitForExec = () =>
      new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject("Timeout waiting for exec"),
          30000
        );
        const check = () => {
          if (command) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(check, 500);
          }
        };
        check();
      });

    // Replace the exec method with a mock that returns a promise that can be manually resolved or rejected
    const mockExecFunction = async (cmd: string) => {
      command = cmd;
      return new Promise<{ stdout: string; stderr: string }>(
        (resolve, reject) => {
          resolvePromise = (value) => {
            resolve(value);
          };
          rejectPromise = reject;
        }
      );
    };

    // Add the __promisify__ property to match typeof child_process.exec
    const childProcessMock: {
      exec: typeof child_process.exec;
    } = {
      exec: Object.assign(mockExecFunction, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __promisify__: mockExecFunction,
      }) as unknown as typeof child_process.exec,
    };

    // The exec method is `promisified` by default, so we need to override the custom method to use our mock
    (childProcessMock.exec as unknown as Record<symbol, unknown>)[
      processGlobals.promisifyCustomSymbol
    ] = childProcessMock.exec;

    // Replace the child process with a mock
    (processGlobals.launcherApplication as LauncherApplication)
      .bind(childProcessBinding)
      .to(childProcessMock);

    // Return functions that can be used to control the exec promise
    return {
      getCommand: () => command,
      resolveExec: async () => {
        await waitForExec();
        resolvePromise({ stdout: "", stderr: "" });
      },
      rejectExec: async (errorMessage: string) => {
        await waitForExec();
        rejectPromise(new Error(errorMessage));
      },
      waitForExec,
    };
  }, ChildProcessBinding.key);
};

/**
 * Mocks the electron.shell.openPath method
 * @param electronApp - The Electron application instance from Playwright
 * @returns A JSHandle to a function that returns the path argument
 */
export const mockElectronShell = async (
  electronApp: ElectronApplication
): Promise<JSHandle<() => { pathArgument: string }>> => {
  return electronApp.evaluateHandle(({ shell }) => {
    let pathArgument = "";

    shell.openPath = (path: string) => {
      pathArgument = path;
      return Promise.resolve("");
    };

    // Return a function to retrieve the captured arguments later
    return () => ({
      pathArgument,
    });
  });
};

/**
 * Mocks the Store<UserPreferences> object and binds it to ConfigBinding
 * @param electronApp The electron application
 * @returns A handle to access whether openInEditor was called
 */
export async function mockUserPreferencesStore(
  electronApp: ElectronApplication
) {
  return electronApp.evaluateHandle(({}, configBindingKey) => {
    const processGlobals = (process as ProcessWithGlobals)._globals_;

    let openInEditorCalled = false;

    // Create a mock Store<UserPreferences> object
    const mockStore = {
      openInEditor: () => {
        openInEditorCalled = true;
        return undefined;
      },
    };

    // Replace the binding with our mock
    (processGlobals.launcherApplication as LauncherApplication)
      .bind(configBindingKey)
      .to(mockStore);

    // Return a function that provides access to the mock's state
    return () => ({
      openInEditorCalled,
    });
  }, ConfigBinding.key);
}

/**
 * Helper function to mock the screen resolution
 * @param electronApp The Electron application instance
 * @param resolution The resolution object with width and height properties
 */
export const mockScreenResolution = async (
  electronApp: ElectronApplication,
  resolution: Resolution
) => {
  // Mock the screen.getPrimaryDisplay method to return the specified resolution
  await electronApp.evaluate(({ screen }, { width, height }) => {
    const originalGetPrimaryDisplay = screen.getPrimaryDisplay;

    // Override the getPrimaryDisplay method
    screen.getPrimaryDisplay = () => {
      // Create a mock display with the specified resolution
      return {
        ...originalGetPrimaryDisplay(),
        size: {
          width,
          height,
        },
        scaleFactor: 1,
      };
    };
  }, resolution);
};

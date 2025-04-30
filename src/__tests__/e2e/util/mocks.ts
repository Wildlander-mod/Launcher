import { ProcessWithGlobals } from "../../../main/types/process-globals";
import { LauncherApplication } from "../../../main/application";
import type { ElectronApplication, JSHandle } from "playwright";
import { ChildProcessBinding } from "../../../main/bindings/child-process.binding";
import psList, { ProcessDescriptor } from "ps-list";
import { PsListBinding } from "../../../main/bindings/psList.binding";
import {
  ProcessKill,
  ProcessKillBinding,
} from "../../../main/bindings/process-kill.binding";

/**
 * Creates a mock for the child process exec method
 * @param electronApp - The Electron application instance from Playwright
 * @returns A JSHandle to a function that returns the command passed to exec
 * @example
 * ```js
 *    const handle = await replaceChildProcessExecWithMock(electronApp);
 *    const command = await handle(x => x());
 *```
 */
export const replaceChildProcessExecWithMock = async (
  electronApp: ElectronApplication
): Promise<JSHandle<() => string>> => {
  return electronApp.evaluateHandle(async ({}, childProcessBinding) => {
    const processGlobals = (process as ProcessWithGlobals)._globals_;

    let file: string;

    // Replace the exec method with a mock that stores the file path to retrieve later
    const childProcessMock = {
      exec: async (command: string) => {
        file = command;
        return { stdout: "", stderr: "" };
      },
    };

    // The exec method is `promisified` by default, so we need to override the custom method to use our mock
    childProcessMock.exec[processGlobals.promisifyCustomSymbol] =
      childProcessMock.exec;

    // Replace the child process with a mock
    (processGlobals.launcherApplication as LauncherApplication)
      .bind(childProcessBinding)
      .to(childProcessMock);

    // Return a function that can be used with `evaluate` to retrieve the file path
    return () => file;
  }, ChildProcessBinding.key);
};

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
      messageBoxMessage = options.message ?? "";
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
      mockPsList[processGlobals.promisifyCustomSymbol] = mockPsList.exec;

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
      lastCalledWith = { pid, signal };
      allCalledWith.push({ pid, signal });
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
 */
export const replaceChildProcessExecWithManualResolveMock = async (
  electronApp: ElectronApplication
): Promise<
  JSHandle<{
    getCommand: () => string;
    resolveExec: () => void;
    getResolved: () => boolean;
  }>
> => {
  return electronApp.evaluateHandle(async ({}, childProcessBinding) => {
    const processGlobals = (process as ProcessWithGlobals)._globals_;

    let command: string;
    let resolvePromise: (value: { stdout: string; stderr: string }) => void;
    let isResolved = false;

    // Replace the exec method with a mock that returns a promise that can be manually resolved
    const childProcessMock = {
      exec: async (cmd: string) => {
        command = cmd;
        return new Promise<{ stdout: string; stderr: string }>((resolve) => {
          resolvePromise = (value) => {
            isResolved = true;
            resolve(value);
          };
        });
      },
    };

    // The exec method is `promisified` by default, so we need to override the custom method to use our mock
    childProcessMock.exec[processGlobals.promisifyCustomSymbol] =
      childProcessMock.exec;

    // Replace the child process with a mock
    (processGlobals.launcherApplication as LauncherApplication)
      .bind(childProcessBinding)
      .to(childProcessMock);

    // Return functions that can be used to control the exec promise
    return {
      getCommand: () => command,
      resolveExec: () => resolvePromise({ stdout: "", stderr: "" }),
      getResolved: () => isResolved,
    };
  }, ChildProcessBinding.key);
};

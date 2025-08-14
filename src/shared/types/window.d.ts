declare global {
  interface Window {
    ipcRenderer: {
      invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
      on: (channel: string, callback: (...args: unknown[]) => unknown) => void;
    };
  }
}

export {};

export class IpcService {
  public invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
    return window.ipcRenderer.invoke(channel, ...args);
  }

  public on(channel: string, listener: (...args: unknown[]) => void) {
    return window.ipcRenderer.on(channel, listener);
  }
}

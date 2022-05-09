import { ipcRenderer } from "electron";

export class IpcService {
  public invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
    return ipcRenderer.invoke(channel, ...args);
  }

  public on(channel: string, listener: (...args: unknown[]) => void) {
    return ipcRenderer.on(channel, listener);
  }
}

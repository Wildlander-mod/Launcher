import { ipcRenderer } from "electron";

export class IpcService {
  public invoke(channel: string, ...args: unknown[]) {
    return ipcRenderer.invoke(channel, ...args);
  }

  public on(channel: string, listener: (...args: unknown[]) => void) {
    return ipcRenderer.on(channel, listener);
  }
}

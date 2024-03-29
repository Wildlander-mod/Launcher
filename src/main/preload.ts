import { contextBridge, ipcRenderer } from "electron";
import log from "electron-log";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipcRenderer", {
  invoke: (channel: string, data: unknown) => {
    return ipcRenderer.invoke(channel, data);
  },
  on: (channel: string, callback: Function) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

contextBridge.exposeInMainWorld("logger", log.functions);

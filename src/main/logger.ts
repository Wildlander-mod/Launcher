import { BindingKey } from "@loopback/core";
import log, { ElectronLog } from "electron-log";

export type Logger = ElectronLog;
export const LoggerBinding = BindingKey.create<Logger>("bindings.logger");

export const newLogInstance = (id: string) => {
  const instance = log.create(id);
  if (process.env["LOG_PATH"]) {
    // If there is an explicit log path set, use it
    instance.transports.file.resolvePath = () =>
      `${process.env["LOG_PATH"]}/${id}.log`;
  }
  return instance;
};

// Export an instance of the logger that the renderer can use because it doesn't use dependency injection.
// It is exposed in the preload script
export const logger = newLogInstance("renderer");

import { BindingKey } from "@loopback/core";
import log from "electron-log/main";
import path from "path";

export type Logger = typeof log;
export const LoggerBinding = BindingKey.create<Logger>("bindings.logger");

log.initialize();

const defaultFilePath = path.dirname(log.transports.file.getFile().path);
const filepath = process.env["LOG_PATH"] ?? defaultFilePath;

log.transports.file.resolvePathFn = (_, message) => {
  return message?.variables?.processType === "renderer"
    ? path.join(filepath, "renderer.log")
    : path.join(filepath, "main.log");
};

import { BindingKey } from "@loopback/core";

export type ProcessKill = (pid: number, signal?: string | number) => boolean;
export const ProcessKillBinding = BindingKey.create<ProcessKill>(
  "bindings.processKill"
);

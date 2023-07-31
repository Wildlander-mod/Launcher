import { BindingKey } from "@loopback/core";
import type * as child_process from "child_process";

export type ChildProcess = typeof child_process;
export const childProcessBinding =
  BindingKey.create<typeof child_process>("isDevelopment");

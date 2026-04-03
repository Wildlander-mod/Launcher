import { type LauncherApplication } from "@/main/application";

export type ProcessWithGlobals = NodeJS.Process & {
  // TODO rename this to __globals when TS is updated
  _globals_: {
    launcherApplication: LauncherApplication;
    promisifyCustomSymbol: symbol;
  };
};

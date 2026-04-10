import { type LauncherApplication } from "../application";

export type ProcessWithGlobals = NodeJS.Process & {
  // TODO rename this to __globals when TS is updated
  _globals_: {
    launcherApplication: LauncherApplication;
    promisifyCustomSymbol: symbol;
  };
};

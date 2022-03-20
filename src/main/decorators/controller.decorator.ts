import { ipcMain, IpcMainInvokeEvent } from "electron";
import { logger } from "@/main/logger";
import { Constructor } from "@loopback/context";

export interface Controller {
  registerHandlers: () => void;
}

const Handlers = "Handlers";

/**
 Add a method to controllers that can be called to register all IPC handlers.
 This is then automatically be called by the booter.
 e.g.
 @controller
 class ExampleController {

    @handler("channelName")
    method(){
      //Do something when 'channelName' event is invoked...
    }

 }
 */
export function controller<T extends Constructor<{}>>(Base: T) {
  return {
    [Base.name]: class extends Base implements Controller {
      public registerHandlers() {
        const handlers = Base.prototype[Handlers];
        handlers.forEach(
          (method: (...args: unknown[]) => unknown, channel: string) => {
            logger.silly(`Registered handler "${channel}"`);
            ipcMain.handle(
              channel,
              (event: IpcMainInvokeEvent, ...args: unknown[]) =>
                method.apply(this, [...args, event])
            );
          }
        );
      }
    },
  }[Base.name];
}

export function handle(channel: string) {
  return function (
    target: Record<string, any>,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) {
    target[Handlers] = target[Handlers] || new Map();
    target[Handlers].set(channel, propertyDescriptor.value);
  };
}

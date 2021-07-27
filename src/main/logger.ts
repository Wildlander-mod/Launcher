import log from "electron-log";
import { isDevelopment } from "@/main/config";

if (!isDevelopment) {
  // Override the default log methods so all logs are caught in the log file for easy debugging
  console.info = log.info;
  console.warn = log.warn;
  console.error = log.error;
  console.log = log.debug; // A lot of third parties create logs so just set it to debug
  console.debug = log.debug;
}

// Export from here in case we want to write any wrappers around the methods or change logger
export const logger = log;

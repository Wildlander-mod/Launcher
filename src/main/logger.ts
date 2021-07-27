import log from "electron-log";

// Override the default log methods so all logs are caught in the log file for easy debugging
console.log = log.log;
console.info = log.info;
console.warn = log.warn;
console.error = log.error;
console.debug = log.debug;

// Export from here in case we want to write any wrappers around the methods or change logger
export const logger = log;

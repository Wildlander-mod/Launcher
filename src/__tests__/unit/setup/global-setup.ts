import { logger } from "@/main/logger";

// Disable logging
logger.transports.console.level = false;
logger.transports.file.level = false;

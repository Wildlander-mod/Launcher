import { isDevelopment } from "@/main/config";

export const getResourcePath = () =>
  isDevelopment ? `./src/assets` : process.resourcesPath;

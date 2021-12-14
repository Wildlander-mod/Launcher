import { isDevelopment } from "@/main/config";

export const getResourcePath = () =>
  isDevelopment ? `${process.cwd()}/src/assets` : process.resourcesPath;

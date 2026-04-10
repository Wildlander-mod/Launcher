import fs from "fs/promises";
import { config } from "./config";

async function globalSetup() {
  // Remove any existing mock files
  await fs.rm(`${config().paths.mockFiles}`, {
    recursive: true,
    force: true,
  });
}

export default globalSetup;

import fs from "fs/promises";
import { config } from "./config";

const clearMockFiles = async () => {
  if (process.env["CLEAR_MOCK_FILES"] !== "false") {
    await fs.rm(`${config().paths.mockFiles}`, {
      recursive: true,
      force: true,
    });
  }
};

async function globalTeardown() {
  await clearMockFiles();
}

export default globalTeardown;

import path from "path";
import os from "os";

const root = path.resolve(`${__dirname}/../../../..`);
const playwrightDir = `${root}/.playwright`;

const resolveExecutablePath = (): string => {
  const platform = process.platform;
  const arch = os.arch();

  if (platform === "darwin") {
    const macDir = arch === "arm64" ? "mac-arm64" : "mac";
    return path.join(
      root,
      "dist",
      macDir,
      "Wildlander Launcher.app",
      "Contents",
      "MacOS",
      "Wildlander Launcher"
    );
  }

  if (platform === "win32") {
    return path.join(root, "dist", "win-unpacked", "Wildlander Launcher.exe");
  }

  return path.join(root, "dist", "linux-unpacked", "wildlander-launcher");
};

export const config = () => ({
  paths: {
    root,
    playwright: playwrightDir,
    screenshots: `${playwrightDir}/screenshots/`,
    mockFiles: `${playwrightDir}/mock-files`,
    app: `${root}/out`,
    executablePath: resolveExecutablePath(),
  },
});

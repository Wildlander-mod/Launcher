import mock from "mock-require";

// electron-is-dev throws an error if not running in an electron environment.
mock("electron-is-dev", () => {
  return true;
});

// @electron-toolkit/utils throws an error if not running in an electron environment.
// Mock the entire package to provide the `is` utility for environment detection.
mock("@electron-toolkit/utils", () => {
  return {
    is: {
      dev: true,
      packaged: false,
      macOS: process.platform === "darwin",
      windows: process.platform === "win32",
      linux: process.platform === "linux",
    },
  };
});

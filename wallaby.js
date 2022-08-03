module.exports = function () {
  return {
    files: ["src/**/*.ts", "!src/__tests__/unit/**/*.ts", "tsconfig.json"],

    tests: ["src/__tests__/unit/**/*.ts"],

    testFramework: "mocha",

    env: {
      type: "node",
    },

    setup: function () {
      if (global._tsconfigPathsRegistered) return;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tsConfigPaths = require("tsconfig-paths");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tsconfig = require("./tsconfig.json");
      tsConfigPaths.register({
        baseUrl: tsconfig.compilerOptions.baseUrl,
        paths: tsconfig.compilerOptions.paths,
      });
      global._tsconfigPathsRegistered = true;
    },
  };
};

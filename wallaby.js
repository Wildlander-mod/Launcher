module.exports = function (w) {
  return {
    files: [
      "src/**/*.ts",
      "src/**/*.js",
      "src/**/*.json",
      "!src/__tests__/unit/**/*.ts",
      "tsconfig.json",
    ],
    tests: ["src/__tests__/unit/**/*.ts"],

    testFramework: "mocha",

    compilers: {
      "**/*.ts": w.compilers.typeScript({
        noResolve: false,
      }),
    },

    env: {
      type: "node",
    },

    setup: function () {
      // Enable TypeScript aliases
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

      // Ensure MockFs has fully reset before starting
      require("mock-fs").restore();
    },
  };
};

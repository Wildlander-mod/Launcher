module.exports = function (w) {
  return {
    files: [
      "src/**/*.ts",
      "src/**/*.js",
      "src/**/*.json",
      "!src/__tests__/**/*.test.ts",
      "tsconfig.json",
      "tsconfig.base.json",
    ],
    tests: ["src/__tests__/unit/**/*.test.ts"],

    testFramework: "mocha",

    compilers: {
      "**/*.ts": w.compilers.typeScript({
        noResolve: false,

        // TODO why is this necessary?
        preserveConstEnums: true,

        // TODO this should come from tsconfig.json
        "esModuleInterop": true,
        "target": "ES2021",
        "module": "CommonJS",
        "importHelpers": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "allowSyntheticDefaultImports": true,
        "sourceMap": true,
        "baseUrl": ".",
        "rootDir": "src",
        "outDir": "dist",
        "resolveJsonModule": true,
        "noPropertyAccessFromIndexSignature": false,
        "paths": {
          "@/*": ["src/*"]
        }
      }),
    },

    env: {
      type: "node",
    },

    setup: function (wallaby) {
      // Ensure MockFs has fully reset before starting
      require("mock-fs").restore();

      // Enable TypeScript aliases
      if (global._tsconfigPathsRegistered) return;
      const tsConfigPaths = require("tsconfig-paths");
      const tsconfig = require("./tsconfig.base.json");
      tsConfigPaths.register({
        baseUrl: tsconfig.compilerOptions.baseUrl,
        paths: {
          "@/*": ["./src/*", "./src/types/*"],
        },
      });
      global._tsconfigPathsRegistered = true;

      require(wallaby.projectCacheDir + "/src/__tests__/unit/helpers/setup");
    },
  };
};

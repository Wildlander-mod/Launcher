module.exports = {
  extends: "@loopback/eslint-config",
  env: {
    node: true,
    mocha: true,
  },
  parserOptions: {
    project: "../../tsconfig.renderer.json",
    tsconfigRootDir: __dirname,
  },
};

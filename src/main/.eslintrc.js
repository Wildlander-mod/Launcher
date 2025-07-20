module.exports = {
  extends: "@loopback/eslint-config",
  root: false,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    project: "../../tsconfig.main.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "enum",
        format: ["UPPER_CASE"],
      },
    ],
  },
};

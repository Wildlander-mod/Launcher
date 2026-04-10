module.exports = {
  presets: ["@babel/preset-typescript"],
  // TODO only include in test mode
  plugins: ["istanbul", "@babel/plugin-proposal-class-properties"],
};

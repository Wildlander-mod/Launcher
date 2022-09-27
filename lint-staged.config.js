module.exports = {
  "*.{js,jsx,vue,ts,tsx}": ["vue-cli-service lint", () => "npm run test:unit"],
  "*.scss": ["npm run lint:styles"],
};

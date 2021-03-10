module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      builderOptions: {
        icon: "public/icon.png"
      }
    }
  }
};

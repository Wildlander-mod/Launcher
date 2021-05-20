module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "Ultimate Skyrim Launcher",
        icon: "public/icon.png",
        publish: {
          provider: "github",
          releaseType: "release"
        }
      }
    }
  }
};

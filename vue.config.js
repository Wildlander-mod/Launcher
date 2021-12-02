module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "Wildlander Launcher",
        icon: "public/icon.png",
        publish: {
          provider: "github",
          releaseType: "release",
        },
        extraMetadata: {
          name: "Wildlander Launcher",
        },
      },
    },
  },
};

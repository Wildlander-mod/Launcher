module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "Wildlander Launcher",
        icon: "public/images/logos/wildlander-icon-light.png",
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

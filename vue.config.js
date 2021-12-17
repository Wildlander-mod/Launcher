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
        extraResources: [
          {
            from: "./src/assets/tools",
            to: "tools",
            filter: ["**/*"],
          },
        ],
        nsis: {
          deleteAppDataOnUninstall: true,
        },
      },
    },
  },
};

import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/main.ts"),
        },
        output: {
          preserveModules: true,
          preserveModulesRoot: "main",
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@renderer": resolve(__dirname, "src/renderer/src"),
      },
    },
    plugins: [vue()],
  },
});

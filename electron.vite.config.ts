import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin, swcPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), swcPlugin()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
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
    publicDir: resolve(__dirname, "src/renderer/public"),
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          '@/main/logger',
        ]
      }
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  },
});

import { createApp } from "vue";
import { getRouter } from "./router";
import VueFinalModal from "vue-final-modal";
import VueClickAway from "vue3-click-away";
import "reflect-metadata";
import App from "@/renderer/App.vue";
import { registerServices } from "@/renderer/services/service-container";

const app = createApp(App);

const { modpackService } = registerServices(app);

app
  .use(getRouter(modpackService))
  .use(VueFinalModal())
  .use(VueClickAway)
  .mount("#app");

// Prevent Mouse 4 and Mouse 5 from navigating the app
// Ref: https://stackoverflow.com/a/66318490 GitHub Issue 654
window.addEventListener("mouseup", (e) => {
  if (e.button === 3 || e.button === 4) e.preventDefault();
});

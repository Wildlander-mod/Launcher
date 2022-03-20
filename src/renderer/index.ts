import { createApp } from "vue";
import { getRouter } from "./router";
import VueFinalModal from "vue-final-modal";
import VueClickAway from "vue3-click-away";
import "reflect-metadata";
import App from "@/renderer/App.vue";
import { registerServices } from "@/renderer/services/service-container";

const app = createApp(App);

const { updateService, modpackService } = registerServices(app);

app
  .use(getRouter(updateService, modpackService))
  .use(VueFinalModal())
  .use(VueClickAway)
  .mount("#app");

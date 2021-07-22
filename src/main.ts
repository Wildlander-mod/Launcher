import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VueFinalModal from "vue-final-modal";
import "reflect-metadata";

createApp(App)
  .use(router)
  .use(VueFinalModal())
  .mount("#app");

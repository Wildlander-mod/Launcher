import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VueFinalModal from "vue-final-modal";
import VueClickAway from "vue3-click-away";
import "reflect-metadata";

createApp(App).use(router).use(VueFinalModal()).use(VueClickAway).mount("#app");

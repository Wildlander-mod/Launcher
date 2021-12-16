import { createRouter, createWebHashHistory } from "vue-router";

import ViewHome from "@/views/ViewHome.vue";
import ViewCommunity from "@/views/ViewCommunity.vue";
import ViewSettings from "@/views/ViewSettings.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: ViewHome,
  },
  {
    path: "/community",
    name: "Community",
    component: ViewCommunity,
  },
  {
    path: "/settings",
    name: "Settings",
    component: ViewSettings,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

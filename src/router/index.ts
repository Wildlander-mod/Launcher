import { createRouter, createWebHashHistory } from "vue-router";

import ViewHome from "@/views/ViewHome.vue";
import ViewCommunity from "@/views/ViewCommunity.vue";
import ViewAdvanced from "@/views/ViewAdvanced.vue";

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
    path: "/advanced",
    name: "Advanced",
    component: ViewAdvanced,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

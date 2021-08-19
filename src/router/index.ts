import { createRouter, createWebHashHistory } from "vue-router";

import Home from "@/views/ViewHome.vue";
import Resources from "@/views/ViewResources.vue";
import Settings from "@/views/ViewSettings.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/resources",
    name: "Resources",
    component: Resources,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

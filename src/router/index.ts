import { createRouter, createWebHashHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Resources from "@/views/Resources.vue";
import Settings from "@/views/Settings.vue";

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

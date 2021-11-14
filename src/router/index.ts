import { createRouter, createWebHashHistory } from "vue-router";

import ViewHome from "@/views/ViewHome.vue";
import ViewResources from "@/views/ViewResources.vue";
import ViewSettings from "@/views/ViewSettings.vue";
import ViewGraphics from "@/views/ViewGraphics.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: ViewHome,
  },
  {
    path: "/graphics",
    name: "Graphics",
    component: ViewGraphics,
  },
  {
    path: "/resources",
    name: "Resources",
    component: ViewResources,
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

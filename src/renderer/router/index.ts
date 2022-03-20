import {
  createRouter,
  createWebHashHistory,
  NavigationGuardWithThis,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";

import ViewHome from "@/renderer/views/ViewHome.vue";
import ViewCommunity from "@/renderer/views/ViewCommunity.vue";
import ViewAdvanced from "@/renderer/views/ViewAdvanced.vue";
import { UpdateService } from "@/renderer/services/update.service";
import AutoUpdate from "@/renderer/views/AutoUpdate.vue";
import ModDirectoryView from "@/renderer/views/ModDirectory.vue";
import { ModpackService } from "@/renderer/services/modpack.service";

const HomeRouteName = "Home";
const AutoUpdateRouteName = "AutoUpdate";
const ModDirectoryRouteName = "ModDirectory";

const checkAutoUpdate =
  (updateService: UpdateService): NavigationGuardWithThis<undefined> =>
  async (to) => {
    if (!updateService.isUpdated()) {
      return {
        name: AutoUpdateRouteName,
        params: { nextRoute: to.fullPath },
      };
    }
  };
const checkModDirectory =
  (modpackService: ModpackService): NavigationGuardWithThis<undefined> =>
  async () => {
    if (
      !(await modpackService.isModDirectorySet()) ||
      !(await modpackService.isModDirectoryValid())
    ) {
      await modpackService.deleteModpackDirectory();
      return {
        name: ModDirectoryRouteName,
      };
    }
  };

const getRoutes = (
  updateService: UpdateService,
  modpackService: ModpackService
): RouteRecordRaw[] =>
  [
    {
      path: "/",
      name: HomeRouteName,
      component: ViewHome,
      beforeEnter: [
        checkAutoUpdate(updateService),
        checkModDirectory(modpackService),
      ],
    },
    {
      path: "/community",
      name: "Community",
      component: ViewCommunity,
      beforeEnter: [
        checkAutoUpdate(updateService),
        checkModDirectory(modpackService),
      ],
    },
    {
      path: "/advanced",
      name: "Advanced",
      component: ViewAdvanced,
      beforeEnter: [
        checkAutoUpdate(updateService),
        checkModDirectory(modpackService),
      ],
    },
    {
      path: "/auto-update/:nextRoute",
      name: AutoUpdateRouteName,
      component: AutoUpdate,
      props: true,
      meta: {
        preload: true,
      },
    },
    {
      path: "/ModDirectory",
      name: ModDirectoryRouteName,
      component: ModDirectoryView,
      props: true,
      meta: {
        preload: true,
      },
      beforeEnter: async (to: RouteLocationNormalized) => {
        if (
          (await modpackService.isModDirectorySet()) &&
          to.name === ModDirectoryRouteName
        ) {
          // If the page is refreshed on the mod directory selection, just redirect to the home page
          return { name: HomeRouteName };
        }
      },
    },
  ]
    // If preload metadata is not set, set it to false
    .map((route) => {
      return {
        ...route,
        meta: { ...route.meta, preload: route.meta?.preload ?? false },
      };
    });

export const getRouter = (
  updateService: UpdateService,
  modpackService: ModpackService
) =>
  createRouter({
    history: createWebHashHistory(),
    routes: getRoutes(updateService, modpackService),
  });

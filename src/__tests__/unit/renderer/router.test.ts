import { IpcService } from "@/renderer/src/services/ipc.service";
import { ModpackService } from "@/renderer/src/services/modpack.service";
import { getRouter } from "@/renderer/src/router";
import type {
  NavigationGuardWithThis,
  RouteLocationNormalized,
} from "vue-router";

jest.mock("@/renderer/src/views/ViewHome.vue", () => ({}));
jest.mock("@/renderer/src/views/ViewCommunity.vue", () => ({}));
jest.mock("@/renderer/src/views/ViewAdvanced.vue", () => ({}));
jest.mock("@/renderer/src/views/AutoUpdate.vue", () => ({}));
jest.mock("@/renderer/src/views/ModDirectory.vue", () => ({}));

Object.defineProperty(window, "ipcRenderer", {
  value: { invoke: jest.fn(), on: jest.fn() },
  writable: true,
});

function makeLocation(name: string): RouteLocationNormalized {
  return {
    name,
    path: `/${name.toLowerCase()}`,
    fullPath: `/${name.toLowerCase()}`,
    query: {},
    hash: "",
    params: {},
    redirectedFrom: undefined,
    meta: {},
    matched: [],
  };
}

describe("router/index.ts #renderer #router", () => {
  let modpackService: ModpackService;
  let spyIsModDirectorySet: jest.SpyInstance;
  let spyIsCurrentModpackValid: jest.SpyInstance;
  let spyDeleteModpackDirectory: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    const ipcService = new IpcService();
    modpackService = new ModpackService(ipcService);
    spyIsModDirectorySet = jest.spyOn(modpackService, "isModDirectorySet");
    spyIsCurrentModpackValid = jest.spyOn(
      modpackService,
      "isCurrentModpackValid"
    );
    spyDeleteModpackDirectory = jest
      .spyOn(modpackService, "deleteModpackDirectory")
      .mockResolvedValue(undefined);
  });

  describe("getRouter()", () => {
    it("should return a router instance", () => {
      const router = getRouter(modpackService);

      expect(router).toBeDefined();
    });

    it("should return a router with a push method", () => {
      const router = getRouter(modpackService);

      expect(typeof router.push).toBe("function");
    });
  });

  describe("checkModDirectory guard", () => {
    async function invokeCheckDirGuard() {
      const router = getRouter(modpackService);
      const homeRoute = router.options.routes.find((r) => r.name === "Home");
      const beforeEnter = homeRoute?.beforeEnter;
      if (!beforeEnter)
        throw new Error("checkModDirectory guard not found on Home route");
      const guard = Array.isArray(beforeEnter) ? beforeEnter[0] : beforeEnter;
      if (!guard) throw new Error("checkModDirectory guard array was empty");
      return (guard as NavigationGuardWithThis<undefined>).call(
        undefined,
        makeLocation("Home"),
        makeLocation("/"),
        () => {}
      );
    }

    it("should redirect to ModDirectory when isModDirectorySet returns false", async () => {
      spyIsModDirectorySet.mockResolvedValue(false);

      const result = await invokeCheckDirGuard();

      expect(result).toEqual({ name: "ModDirectory" });
    });

    it("should call deleteModpackDirectory when isModDirectorySet returns false", async () => {
      spyIsModDirectorySet.mockResolvedValue(false);

      await invokeCheckDirGuard();

      expect(spyDeleteModpackDirectory).toHaveBeenCalled();
    });

    it("should return undefined when both checks pass", async () => {
      spyIsModDirectorySet.mockResolvedValue(true);
      spyIsCurrentModpackValid.mockResolvedValue({ ok: true });

      const result = await invokeCheckDirGuard();

      expect(result).toBeUndefined();
    });

    it("should not call deleteModpackDirectory when both checks pass", async () => {
      spyIsModDirectorySet.mockResolvedValue(true);
      spyIsCurrentModpackValid.mockResolvedValue({ ok: true });

      await invokeCheckDirGuard();

      expect(spyDeleteModpackDirectory).not.toHaveBeenCalled();
    });
  });

  describe("ModDirectory route beforeEnter guard", () => {
    async function invokeModDirGuard(to: RouteLocationNormalized) {
      const router = getRouter(modpackService);
      const modDirRoute = router.options.routes.find(
        (r) => r.name === "ModDirectory"
      );
      const guard = modDirRoute?.beforeEnter;
      if (!guard || Array.isArray(guard))
        throw new Error(
          "ModDirectory guard not found or unexpectedly an array"
        );
      return (guard as NavigationGuardWithThis<undefined>).call(
        undefined,
        to,
        makeLocation("/"),
        () => {}
      );
    }

    it("should redirect to Home when directory is set and navigating to ModDirectory", async () => {
      spyIsModDirectorySet.mockResolvedValue(true);

      const result = await invokeModDirGuard(makeLocation("ModDirectory"));

      expect(result).toEqual({ name: "Home" });
    });

    it("should return undefined when isModDirectorySet returns false", async () => {
      spyIsModDirectorySet.mockResolvedValue(false);

      const result = await invokeModDirGuard(makeLocation("ModDirectory"));

      expect(result).toBeUndefined();
    });
  });

  describe("route preload meta", () => {
    it("should set preload to true for the AutoUpdate route", () => {
      const router = getRouter(modpackService);
      const route = router.options.routes.find((r) => r.name === "AutoUpdate");

      expect(route?.meta?.preload).toBe(true);
    });

    it("should set preload to true for the ModDirectory route", () => {
      const router = getRouter(modpackService);
      const route = router.options.routes.find(
        (r) => r.name === "ModDirectory"
      );

      expect(route?.meta?.preload).toBe(true);
    });

    it("should default preload to false for the Home route", () => {
      const router = getRouter(modpackService);
      const route = router.options.routes.find((r) => r.name === "Home");

      expect(route?.meta?.preload).toBe(false);
    });

    it("should default preload to false for the Community route", () => {
      const router = getRouter(modpackService);
      const route = router.options.routes.find((r) => r.name === "Community");

      expect(route?.meta?.preload).toBe(false);
    });

    it("should default preload to false for the Advanced route", () => {
      const router = getRouter(modpackService);
      const route = router.options.routes.find((r) => r.name === "Advanced");

      expect(route?.meta?.preload).toBe(false);
    });
  });
});

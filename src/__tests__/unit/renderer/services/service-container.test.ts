import { inject } from "vue";
import type { App } from "vue";
import {
  createBinding,
  registerServices,
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/src/services/service-container";

jest.mock("vue", () => ({
  ...jest.requireActual("vue"),
  inject: jest.fn(),
}));

jest.mock("@/renderer/src/services/ipc.service", () => ({
  IpcService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/modpack.service", () => ({
  ModpackService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/cache.service", () => ({
  CacheService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/patreon.service", () => ({
  PatreonService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/posts.service", () => ({
  PostsService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/message.service", () => ({
  MessageService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/modal.service", () => ({
  ModalService: jest.fn(() => ({})),
}));

jest.mock("@/renderer/src/services/event.service", () => ({
  EventService: {},
}));

const mockInject = inject as jest.Mock;

describe("service-container #renderer #service", () => {
  let mockApp: { provide: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = { provide: jest.fn() };
  });

  describe("createBinding()", () => {
    it("should return a Symbol", () => {
      expect(typeof createBinding("test")).toBe("symbol");
    });

    it("should return a Symbol whose description matches the provided key string", () => {
      const key = createBinding("my.service.key");

      expect(key.description).toBe("my.service.key");
    });

    it("should return a unique Symbol for each call with the same key string", () => {
      const key1 = createBinding("same-key");
      const key2 = createBinding("same-key");

      expect(key1).not.toBe(key2);
    });
  });

  describe("registerServices()", () => {
    it("should call app.provide with SERVICE_BINDINGS.IPC_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.IPC_SERVICE,
        expect.anything()
      );
    });

    it("should call app.provide with SERVICE_BINDINGS.PATRON_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.PATRON_SERVICE,
        expect.anything()
      );
    });

    it("should call app.provide with SERVICE_BINDINGS.NEWS_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.NEWS_SERVICE,
        expect.anything()
      );
    });

    it("should call app.provide with SERVICE_BINDINGS.MESSAGE_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.MESSAGE_SERVICE,
        expect.anything()
      );
    });

    it("should call app.provide with SERVICE_BINDINGS.EVENT_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.EVENT_SERVICE,
        expect.anything()
      );
    });

    it("should call app.provide with SERVICE_BINDINGS.MODAL_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.MODAL_SERVICE,
        expect.anything()
      );
    });

    it("should call app.provide with SERVICE_BINDINGS.MODPACK_SERVICE", () => {
      registerServices(mockApp as unknown as App);

      expect(mockApp.provide).toHaveBeenCalledWith(
        SERVICE_BINDINGS.MODPACK_SERVICE,
        expect.anything()
      );
    });

    it("should return the ipcService instance that was provided to the app", () => {
      const result = registerServices(mockApp as unknown as App);
      const ipcCall = mockApp.provide.mock.calls.find(
        ([key]) => key === SERVICE_BINDINGS.IPC_SERVICE
      );

      expect(result.ipcService).toBe(ipcCall?.[1]);
    });

    it("should return the modpackService instance that was provided to the app", () => {
      const result = registerServices(mockApp as unknown as App);
      const modpackCall = mockApp.provide.mock.calls.find(
        ([key]) => key === SERVICE_BINDINGS.MODPACK_SERVICE
      );

      expect(result.modpackService).toBe(modpackCall?.[1]);
    });
  });

  describe("injectStrict()", () => {
    it("should return the resolved value when inject returns a truthy value", () => {
      const resolved = { name: "service" };
      mockInject.mockReturnValue(resolved);
      const key = createBinding<typeof resolved>("test.key");

      expect(injectStrict(key)).toBe(resolved);
    });

    it("should throw when inject returns undefined", () => {
      mockInject.mockReturnValue(undefined);
      const key = createBinding("missing.key");

      expect(() => injectStrict(key)).toThrow();
    });

    it("should include the key description in the thrown error message", () => {
      mockInject.mockReturnValue(undefined);
      const key = createBinding("my.service.key");

      expect(() => injectStrict(key)).toThrow("my.service.key");
    });

    it("should return the fallback value when inject resolves via the fallback", () => {
      const fallback = { name: "fallback" };
      mockInject.mockReturnValue(fallback);
      const key = createBinding<typeof fallback>("test.key");

      expect(injectStrict(key, fallback)).toBe(fallback);
    });
  });
});

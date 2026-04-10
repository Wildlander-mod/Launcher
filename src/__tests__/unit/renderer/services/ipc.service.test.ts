import { IpcService } from "../../../../renderer/src/services/ipc.service";

const mockInvoke = jest.fn();
const mockOn = jest.fn();

Object.defineProperty(window, "ipcRenderer", {
  value: { invoke: mockInvoke, on: mockOn },
  writable: true,
});

describe("IpcService #renderer #service", () => {
  let service: IpcService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IpcService();
  });

  describe("invoke()", () => {
    it("should forward the channel to ipcRenderer.invoke", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await service.invoke("test-channel");

      expect(mockInvoke).toHaveBeenCalledWith("test-channel");
    });

    it("should spread multiple args to ipcRenderer.invoke", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await service.invoke("test-channel", "arg1", 42);

      expect(mockInvoke).toHaveBeenCalledWith("test-channel", "arg1", 42);
    });

    it("should work with no extra args", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await service.invoke("no-args-channel");

      expect(mockInvoke).toHaveBeenCalledWith("no-args-channel");
    });

    it("should resolve with the value returned by ipcRenderer.invoke", async () => {
      mockInvoke.mockResolvedValue({ status: "ok" });

      const result = await service.invoke<{ status: string }>("test-channel");

      expect(result).toEqual({ status: "ok" });
    });

    it("should reject when ipcRenderer.invoke rejects", async () => {
      mockInvoke.mockRejectedValue(new Error("ipc error"));

      await expect(service.invoke("test-channel")).rejects.toThrow("ipc error");
    });
  });

  describe("on()", () => {
    it("should forward channel and listener to ipcRenderer.on", () => {
      const listener = jest.fn();

      service.on("test-channel", listener);

      expect(mockOn).toHaveBeenCalledWith("test-channel", listener);
    });

    it("should return the value from ipcRenderer.on", () => {
      const returnValue = { removeListener: jest.fn() };
      mockOn.mockReturnValue(returnValue);

      const result = service.on("test-channel", jest.fn());

      expect(result).toBe(returnValue);
    });
  });
});

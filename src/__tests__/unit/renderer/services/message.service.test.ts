import { MessageService } from "../../../../renderer/src/services/message.service";
import type { IpcService } from "../../../../renderer/src/services/ipc.service";

jest.mock("electron-log/renderer", () => ({
  error: jest.fn(),
}));

import logger from "electron-log/renderer";

const mockLogger = logger as jest.Mocked<typeof logger>;

describe("MessageService #renderer #service", () => {
  let service: MessageService;
  let mockIpcService: jest.Mocked<IpcService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIpcService = { invoke: jest.fn(), on: jest.fn() };
    service = new MessageService(mockIpcService);
  });

  describe("error()", () => {
    it("should log to logger.error with title and error message", async () => {
      mockIpcService.invoke.mockResolvedValue(undefined);

      await service.error({ title: "Something failed", error: "bad input" });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Something failed: bad input"
      );
    });

    it("should invoke ipcService with the ERROR channel", async () => {
      mockIpcService.invoke.mockResolvedValue(undefined);

      await service.error({ title: "Title", error: "Error" });

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "ERROR",
        expect.anything()
      );
    });

    it("should pass title and error as payload to ipcService", async () => {
      mockIpcService.invoke.mockResolvedValue(undefined);

      await service.error({ title: "My Title", error: "My Error" });

      expect(mockIpcService.invoke).toHaveBeenCalledWith("ERROR", {
        title: "My Title",
        error: "My Error",
      });
    });
  });

  describe("confirmation()", () => {
    it("should invoke ipcService with the CONFIRMATION channel", async () => {
      mockIpcService.invoke.mockResolvedValue({
        response: 0,
        checkboxChecked: false,
      });

      await service.confirmation("Are you sure?", ["Yes", "No"]);

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "CONFIRMATION",
        expect.anything()
      );
    });

    it("should pass message and buttons as payload to ipcService", async () => {
      mockIpcService.invoke.mockResolvedValue({
        response: 0,
        checkboxChecked: false,
      });

      await service.confirmation("Are you sure?", ["Yes", "No"]);

      expect(mockIpcService.invoke).toHaveBeenCalledWith("CONFIRMATION", {
        message: "Are you sure?",
        buttons: ["Yes", "No"],
      });
    });

    it("should return the value resolved by ipcService.invoke", async () => {
      const returnValue = { response: 1, checkboxChecked: false };
      mockIpcService.invoke.mockResolvedValue(returnValue);

      const result = await service.confirmation("Continue?", ["OK", "Cancel"]);

      expect(result).toBe(returnValue);
    });

    it("should reject when ipcService.invoke rejects", async () => {
      mockIpcService.invoke.mockRejectedValue(new Error("ipc failure"));

      await expect(service.confirmation("Continue?", ["OK"])).rejects.toThrow(
        "ipc failure"
      );
    });
  });
});

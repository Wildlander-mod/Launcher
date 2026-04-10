import { ModpackService } from "../../../../renderer/src/services/modpack.service";
import type { IpcService } from "../../../../renderer/src/services/ipc.service";

describe("ModpackService #renderer #service", () => {
  let service: ModpackService;
  let mockIpcService: jest.Mocked<IpcService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIpcService = { invoke: jest.fn(), on: jest.fn() };
    service = new ModpackService(mockIpcService);
  });

  describe("isModDirectorySet()", () => {
    it("should invoke ipcService with the IS_MODPACK_SET channel", async () => {
      mockIpcService.invoke.mockResolvedValue(true);

      await service.isModDirectorySet();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("IS_MODPACK_SET");
    });
  });

  describe("getModpackDirectory()", () => {
    it("should invoke ipcService with the GET_MODPACK channel", async () => {
      mockIpcService.invoke.mockResolvedValue("/mods");

      await service.getModpackDirectory();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("GET_MODPACK");
    });

    it("should return the resolved directory string", async () => {
      mockIpcService.invoke.mockResolvedValue("/mods/wildlander");

      const result = await service.getModpackDirectory();

      expect(result).toBe("/mods/wildlander");
    });
  });

  describe("isModDirectoryValid()", () => {
    it("should invoke ipcService with the IS_MODPACK_DIRECTORY_VALID channel", async () => {
      mockIpcService.invoke.mockResolvedValue({ ok: true });

      await service.isModDirectoryValid("/mods");

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "IS_MODPACK_DIRECTORY_VALID",
        expect.anything()
      );
    });

    it("should pass the mod directory to ipcService", async () => {
      mockIpcService.invoke.mockResolvedValue({ ok: true });

      await service.isModDirectoryValid("/mods/wildlander");

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "IS_MODPACK_DIRECTORY_VALID",
        "/mods/wildlander"
      );
    });

    it("should return the IsModpackValidResponse", async () => {
      const response = { ok: false, missingPaths: ["Data/"] };
      mockIpcService.invoke.mockResolvedValue(response);

      const result = await service.isModDirectoryValid("/mods");

      expect(result).toBe(response);
    });
  });

  describe("isCurrentModpackValid()", () => {
    it("should invoke GET_MODPACK to fetch the current directory", async () => {
      mockIpcService.invoke
        .mockResolvedValueOnce("/mods/wildlander")
        .mockResolvedValueOnce({ ok: true });

      await service.isCurrentModpackValid();

      expect(mockIpcService.invoke).toHaveBeenCalledWith("GET_MODPACK");
    });

    it("should invoke IS_MODPACK_DIRECTORY_VALID with the directory returned by GET_MODPACK", async () => {
      mockIpcService.invoke
        .mockResolvedValueOnce("/mods/wildlander")
        .mockResolvedValueOnce({ ok: true });

      await service.isCurrentModpackValid();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "IS_MODPACK_DIRECTORY_VALID",
        "/mods/wildlander"
      );
    });

    it("should return the validation result", async () => {
      const validationResult = { ok: true };
      mockIpcService.invoke
        .mockResolvedValueOnce("/mods/wildlander")
        .mockResolvedValueOnce(validationResult);

      const result = await service.isCurrentModpackValid();

      expect(result).toBe(validationResult);
    });
  });

  describe("deleteModpackDirectory()", () => {
    it("should invoke ipcService with the DELETE_MODPACK_DIRECTORY channel", async () => {
      mockIpcService.invoke.mockResolvedValue(undefined);

      await service.deleteModpackDirectory();

      expect(mockIpcService.invoke).toHaveBeenCalledWith(
        "DELETE_MODPACK_DIRECTORY"
      );
    });
  });
});

import { PatreonService } from "@/renderer/src/services/patreon.service";
import type { Patron } from "@/renderer/src/services/patreon.service";
import type { CacheService } from "@/renderer/src/services/cache.service";

jest.mock("electron-log/renderer", () => ({
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

const mockPatrons: Patron[] = [
  { name: "Alice", tier: "Patron" },
  { name: "Bob", tier: "Super Patron" },
  { name: "Carol", tier: "Patron" },
];

describe("PatreonService #renderer #service", () => {
  let service: PatreonService;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheService = { get: jest.fn(), set: jest.fn() };
    mockCacheService.get.mockReturnValue(undefined);
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ patrons: mockPatrons }),
    });
    service = new PatreonService(mockCacheService);
  });

  describe("getPatrons() — cache miss, fresh API fetch", () => {
    it("should call fetch with the patreon API URL", async () => {
      await service.getPatrons();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://ultsky.phinocio.com/api/patreon"
      );
    });

    it("should call cacheService.set with the cache key and patrons after fetching", async () => {
      await service.getPatrons();

      expect(mockCacheService.set).toHaveBeenCalledWith(
        "patreon.patrons",
        expect.any(Array)
      );
    });

    it("should return the fetched patrons", async () => {
      const result = await service.getPatrons();

      expect(result).toHaveLength(mockPatrons.length);
    });

    it("should return patrons in original order when shuffle=false", async () => {
      const result = await service.getPatrons(false);

      expect(result).toEqual(mockPatrons);
    });
  });

  describe("getPatrons() — cache hit", () => {
    beforeEach(() => {
      mockCacheService.get.mockReturnValue({
        age: Date.now(),
        content: mockPatrons,
      });
    });

    it("should not call fetch when cache returns patrons", async () => {
      await service.getPatrons();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return the cached patrons", async () => {
      const result = await service.getPatrons();

      expect(result).toBe(mockPatrons);
    });
  });

  describe("getPatrons() — in-memory patrons (second call)", () => {
    beforeEach(async () => {
      await service.getPatrons();
      jest.clearAllMocks();
    });

    it("should not call fetch on a second getPatrons() call", async () => {
      await service.getPatrons();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should not call cacheService.get on a second getPatrons() call", async () => {
      await service.getPatrons();

      expect(mockCacheService.get).not.toHaveBeenCalled();
    });
  });

  describe("getPatrons() — error path", () => {
    it("should throw with message starting 'Failed to get Patrons:' when fetch rejects", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("network error"));

      await expect(service.getPatrons()).rejects.toThrow(
        "Failed to get Patrons:"
      );
    });
  });
});

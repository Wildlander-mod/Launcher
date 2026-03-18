import { CacheService } from "@/renderer/src/services/cache.service";

jest.mock("electron-log/renderer", () => ({
  debug: jest.fn(),
}));

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("CacheService #renderer #service", () => {
  let service: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    service = new CacheService();
  });

  describe("get()", () => {
    it("should return undefined when key is not in localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = service.get("missing-key");

      expect(result).toBeUndefined();
    });

    it("should return cached content when key exists and no maxAge is given", () => {
      const stored = { age: Date.now(), content: { foo: "bar" } };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(stored));

      const result = service.get("my-key");

      expect(result?.content).toEqual({ foo: "bar" });
    });

    it("should return cached content when stored age is within maxAge", () => {
      const now = 1_000_000;
      jest.useFakeTimers("modern");
      jest.setSystemTime(now);
      const stored = { age: now - 5000, content: "fresh" };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(stored));

      const result = service.get("my-key", 10);

      expect(result?.content).toBe("fresh");
    });

    it("should return undefined when stored age exceeds maxAge", () => {
      const now = 1_000_000;
      jest.useFakeTimers("modern");
      jest.setSystemTime(now);
      const stored = { age: now - 20_000, content: "stale" };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(stored));

      const result = service.get("my-key", 10);

      expect(result).toBeUndefined();
    });
  });

  describe("set()", () => {
    it("should call localStorage.setItem with the correct key", () => {
      service.set("my-key", { value: 42 });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "my-key",
        expect.any(String)
      );
    });

    it("should serialise content with the current timestamp", () => {
      const now = 1_000_000;
      jest.useFakeTimers("modern");
      jest.setSystemTime(now);

      service.set("my-key", { value: 42 });

      const serialised = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(serialised).toEqual({ age: now, content: { value: 42 } });
    });
  });
});

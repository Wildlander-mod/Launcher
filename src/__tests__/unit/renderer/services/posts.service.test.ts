import { PostsService } from "@/renderer/src/services/posts.service";
import type { Post } from "@/renderer/src/services/posts.service";
import type { CacheService } from "@/renderer/src/services/cache.service";

jest.mock("electron-log/renderer", () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const mockPosts: Post[] = [
  {
    title: "Post 1",
    content: "Content 1",
    published: "2024-01-01",
    url: "http://example.com/1",
    tags: [],
  },
  {
    title: "Post 2",
    content: "Content 2",
    published: "2024-01-02",
    url: "http://example.com/2",
    tags: ["news"],
  },
];

const freshPosts: Post[] = [
  {
    title: "Fresh Post",
    content: "Fresh Content",
    published: "2024-06-01",
    url: "http://example.com/3",
    tags: [],
  },
];

const CACHE_AGE_MS = 1_000_000_000;
const CACHE_AGE_SECS = CACHE_AGE_MS / 1000;

describe("PostsService #renderer #service", () => {
  let service: PostsService;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheService = { get: jest.fn(), set: jest.fn() };
    mockCacheService.get.mockReturnValue(undefined);
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes("last-updated")) {
        return Promise.resolve({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          json: jest
            .fn()
            .mockResolvedValue({ last_updated: CACHE_AGE_SECS - 1 }),
        });
      }
      return Promise.resolve({
        json: jest.fn().mockResolvedValue({ posts: mockPosts }),
      });
    });
    service = new PostsService(mockCacheService);
  });

  describe("getPosts() — in-memory path", () => {
    beforeEach(async () => {
      mockCacheService.get.mockReturnValue(undefined);
      await service.getPosts();
      jest.clearAllMocks();
    });

    it("should return in-memory posts without calling cacheService.get", async () => {
      await service.getPosts();

      expect(mockCacheService.get).not.toHaveBeenCalled();
    });

    it("should return in-memory posts without calling fetch", async () => {
      await service.getPosts();

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("getPosts() — cache hit, up-to-date", () => {
    beforeEach(() => {
      mockCacheService.get.mockReturnValue({
        age: CACHE_AGE_MS,
        content: mockPosts,
      });
      // last-updated returns a timestamp older than cache → not outdated
      global.fetch = jest.fn().mockResolvedValue({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        json: jest.fn().mockResolvedValue({ last_updated: CACHE_AGE_SECS - 1 }),
      });
    });

    it("should return the cached posts", async () => {
      const result = await service.getPosts();

      expect(result).toBe(mockPosts);
    });

    it("should not call cacheService.set when cache is up-to-date", async () => {
      await service.getPosts();
      await flushPromises();

      expect(mockCacheService.set).not.toHaveBeenCalled();
    });
  });

  describe("getPosts() — cache hit, outdated", () => {
    beforeEach(() => {
      mockCacheService.get.mockReturnValue({
        age: CACHE_AGE_MS,
        content: mockPosts,
      });
      // last-updated returns a timestamp newer than cache → outdated
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes("last-updated")) {
          return Promise.resolve({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            json: jest
              .fn()
              .mockResolvedValue({ last_updated: CACHE_AGE_SECS + 1 }),
          });
        }
        return Promise.resolve({
          json: jest.fn().mockResolvedValue({ posts: freshPosts }),
        });
      });
    });

    it("should return the cached posts immediately before background fetch completes", async () => {
      const result = await service.getPosts();

      expect(result).toBe(mockPosts);
    });

    it("should call cacheService.set to update the cache after background fetch", async () => {
      await service.getPosts();
      await flushPromises();

      expect(mockCacheService.set).toHaveBeenCalledWith(
        "patreon.posts",
        freshPosts
      );
    });

    it("should call afterFetch with the refreshed posts when provided", async () => {
      const afterFetch = jest.fn();

      await service.getPosts(afterFetch);
      await flushPromises();

      expect(afterFetch).toHaveBeenCalledWith(freshPosts);
    });
  });

  describe("getPosts() — cache miss", () => {
    it("should call fetch with the posts API URL", async () => {
      await service.getPosts();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://ultsky.phinocio.com/api/patreon"
      );
    });

    it("should return the fetched posts", async () => {
      const result = await service.getPosts();

      expect(result).toEqual(mockPosts);
    });

    it("should call cacheService.set with the fetched posts", async () => {
      await service.getPosts();

      expect(mockCacheService.set).toHaveBeenCalledWith(
        "patreon.posts",
        mockPosts
      );
    });
  });

  describe("getPosts() — error path", () => {
    it("should throw with message starting 'Failed to get News:' when fetch rejects", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("network error"));

      await expect(service.getPosts()).rejects.toThrow("Failed to get News:");
    });
  });
});

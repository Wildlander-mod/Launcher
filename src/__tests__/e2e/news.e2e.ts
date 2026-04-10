import { Page, test, expect } from "@playwright/test";
import { startTestApp, setModpackAndWaitForAppLoaded } from "./util/setup";
import {
  mockPosts,
  mockPatreonEndpoint,
  mockLastUpdated,
  mockPatreonError,
  mockLastUpdatedError,
} from "./util/patreon";

test.describe("News", () => {
  let window: Page;
  let closeTestApp: Awaited<ReturnType<typeof startTestApp>>["closeTestApp"];

  test.beforeEach(async () => {
    ({ window, closeTestApp } = await startTestApp(test));
    await setModpackAndWaitForAppLoaded(window);

    // Mock the API responses
    await mockPatreonEndpoint(window, { posts: mockPosts });
    await mockLastUpdated(window);

    // Clear localStorage before each test to ensure a clean state
    await window.evaluate(() => {
      localStorage.clear();
    });
  });

  test.afterEach(async () => {
    // Reset all mocked routes
    await window.unroute("**");

    // Close the app
    await closeTestApp();
  });

  test("should fetch and display posts on first load with no cache", async () => {
    // Reload the page (with cleared localStorage from beforeEach)
    await window.reload();

    // Wait for the news container to be visible
    await window.getByTestId("news-container").waitFor({ state: "visible" });

    // Check that the mock posts are displayed
    await expect(window.getByTestId("news-item-Test Post 1")).toBeVisible();
    await expect(window.getByTestId("news-item-Test Post 2")).toBeVisible();

    // Verify that the cache was created
    const cache = await window.evaluate(() => {
      return localStorage.getItem("patreon.posts");
    });

    expect(cache).not.toBeNull();
    const parsedCache = JSON.parse(cache as string);
    expect(parsedCache).toEqual({
      age: expect.any(Number),
      content: mockPosts,
    });
  });

  test("should display cached data first and update with new results when cache is outdated", async () => {
    // Set up a mock for last-updated that indicates the cache is outdated
    await mockLastUpdated(window, -1800); // 30 minutes in the past

    // First load to populate the cache with a timestamp from 1 hour ago
    await window.evaluate(() => {
      localStorage.setItem(
        "patreon.posts",
        JSON.stringify({
          age: Date.now() - 3600000,
          content: [
            {
              title: "Old Post",
              content: "This is an old post",
              published: "2023-01-01T00:00:00Z",
              url: "/old-post",
              tags: ["test", "old"],
            },
          ],
        })
      );
    });

    // Set up the updated posts that should be added on top
    const updatedMockPosts = [
      {
        title: "Fresh Post",
        content: "This is a fresh post",
        published: "2023-01-03T00:00:00Z",
        url: "/fresh-post",
        tags: ["test", "fresh"],
      },
    ];

    // Mock the API to return the updated posts
    await mockPatreonEndpoint(window, { posts: updatedMockPosts });

    // Reload the page
    await window.reload();

    // Check that both cached and fresh data are visible
    await expect(window.getByTestId("news-item-Fresh Post")).toBeVisible();
    await expect(window.getByTestId("news-item-Old Post")).toBeVisible();
  });

  test("should only use cached data when it is not outdated and not call the patreon endpoint", async () => {
    // Set up a mock for last-updated that indicates the cache is still valid
    const oneHourAgo = -3600; // 1 hour ago in seconds
    await mockLastUpdated(window, oneHourAgo);

    // Populate the cache with a later timestamp
    await window.evaluate(() => {
      localStorage.setItem(
        "patreon.posts",
        JSON.stringify({
          age: Date.now(),
          content: [
            {
              title: "Cached Post",
              content: "This is a cached post",
              published: "2023-01-01T00:00:00Z",
              url: "/cached-post",
              tags: ["test", "cache"],
            },
          ],
        })
      );
      // If there is no patrons in the cache, the patreon API will be called making it difficult to assert if the test worked
      localStorage.setItem(
        "patreon.patrons",
        JSON.stringify({
          age: Date.now(),
          content: [{ name: "test", tier: "test" }],
        })
      );
    });

    // Mock the patreon endpoint to track if it is called
    let patreonCalled = false;
    await window.route("**/api/patreon", () => {
      patreonCalled = true; // Track any call
    });

    // Reload the page
    await window.reload();

    // It should only show the cached data
    await window.getByTestId("news-container").waitFor({ state: "visible" });
    await expect(window.getByTestId("news-item-Cached Post")).toBeVisible();

    // Assert the patreon endpoint was not called
    expect(patreonCalled).toBe(false);
  });

  test("should show error message when patreon API fails", async () => {
    // Mock the patreon API to return an error
    await mockPatreonError(window);

    // Reload the page
    await window.reload();

    // Check that the error message is displayed
    await window.getByTestId("news-error").waitFor({ state: "visible" });
    await expect(window.getByTestId("news-error")).toHaveText(
      "Unable to load latest news."
    );
  });

  test("should fetch posts directly when last-updated API fails and there's no cache", async () => {
    // Mock the last-updated API to return an error
    await mockLastUpdatedError(window);

    // Reload the page
    await window.reload();

    // The component should still try to fetch posts directly
    // Wait for the news container to be visible
    await window.getByTestId("news-container").waitFor({ state: "visible" });

    // Check that the mock posts are displayed
    await expect(window.getByTestId("news-item-Test Post 1")).toBeVisible();
    await expect(window.getByTestId("news-item-Test Post 2")).toBeVisible();
  });

  test("should handle empty news list gracefully", async () => {
    // Mock the patreon API to return an empty list
    await mockPatreonEndpoint(window, { posts: [] });

    // Reload the page
    await window.reload();

    // The news container should not be visible since there are no posts
    await expect(window.getByTestId("news-container")).not.toBeVisible();

    // Error message should not be visible either since it's not an error
    await expect(window.getByTestId("news-error")).not.toBeVisible();
  });

  test("should show an error if the last-updated API fails", async () => {
    // Populate the cache
    await window.evaluate(() => {
      const currentTime = Date.now(); // Current time in ms
      localStorage.setItem(
        "patreon.posts",
        JSON.stringify({
          age: currentTime,
          content: [
            {
              title: "Cached Post For Error",
              content: "This is a cached post for error testing",
              published: "2023-01-01T00:00:00Z",
              url: "/cached-post-error",
              tags: ["test", "cache", "error"],
            },
          ],
        })
      );
    });

    // Mock the last-updated API to return an error
    await mockLastUpdatedError(window);

    // Reload the page
    await window.reload();

    // It should show an error message
    await window.getByTestId("news-error").waitFor({ state: "visible" });
    await expect(window.getByTestId("news-error")).toHaveText(
      "Unable to load latest news."
    );
  });

  test("should handle cache invalidation correctly", async () => {
    // Set up a very old cache
    await window.evaluate(() => {
      const oldTime = Date.now() - 86400000; // 24 hours ago in ms
      localStorage.setItem(
        "patreon.posts",
        JSON.stringify({
          age: oldTime,
          content: [
            {
              title: "Very Old Post",
              content: "This is a very old post",
              published: "2023-01-01T00:00:00Z",
              url: "/very-old-post",
              tags: ["test", "old"],
            },
          ],
        })
      );
    });

    // Set up a mock for last-updated that indicates the cache is outdated
    await mockLastUpdated(window); // Current time, definitely newer than cache

    // Set up new posts to be fetched
    const newMockPosts = [
      {
        title: "Brand New Post",
        content: "This is a brand new post",
        published: "2023-01-05T00:00:00Z",
        url: "/brand-new-post",
        tags: ["test", "new"],
      },
    ];

    // Mock the patreon API to return the new posts
    await mockPatreonEndpoint(window, { posts: newMockPosts });

    // Reload the page
    await window.reload();

    // After the API call, it should show both the old and new posts
    await expect(window.getByTestId("news-item-Brand New Post")).toBeVisible();
    await expect(window.getByTestId("news-item-Very Old Post")).toBeVisible();

    // Verify that the cache was updated
    const cache = await window.evaluate(() => {
      return localStorage.getItem("patreon.posts");
    });

    expect(cache).not.toBeNull();
    const parsedCache = JSON.parse(cache as string);
    expect(parsedCache.content).toEqual(newMockPosts);
  });
});

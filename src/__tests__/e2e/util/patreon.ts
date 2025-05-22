import { Page } from "@playwright/test";
import { Patron } from "../../../renderer/services/patreon.service";
import { Post } from "../../../renderer/services/posts.service";

// Mock data for news posts
export const mockPosts: Post[] = [
  {
    title: "Test Post 1",
    content: "This is test post 1",
    published: "2023-01-01T00:00:00Z",
    url: "/test-post-1",
    tags: ["test", "news"],
  },
  {
    title: "Test Post 2",
    content: "This is test post 2",
    published: "2023-01-02T00:00:00Z",
    url: "/test-post-2",
    tags: ["test", "announcement"],
  },
];

// Mock data for patrons
export const mockPatrons: Patron[] = [
  {
    name: "Test Super Patron 1",
    tier: "Super Patron",
  },
  {
    name: "Test Super Patron 2",
    tier: "Super Patron",
  },
  {
    name: "Test Patron 1",
    tier: "Patron",
  },
  {
    name: "Test Patron 2",
    tier: "Patron",
  },
];

/**
 * Get a mock last_updated timestamp
 * @param offsetSeconds Optional offset in seconds to apply to the current time
 * @returns A mock last_updated object with timestamp in seconds
 */
export const getMockLastUpdated = (
  offsetSeconds = 0
): {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  last_updated: number;
} => {
  return {
    // This value comes from the API so it cannot be changed to fit the convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    last_updated: Math.floor(Date.now() / 1000) + offsetSeconds,
  };
};

/**
 * Mock the Patreon API endpoint for both posts and patrons
 * @param window The Playwright Page object
 * @param mockData The mock data to return in the response
 */
export const mockPatreonEndpoint = async (
  window: Page,
  mockData: { posts?: Post[]; patrons?: Patron[] } = {}
): Promise<void> => {
  const { posts = mockPosts, patrons = mockPatrons } = mockData;

  await window.route("**/api/patreon", (route) => {
    return route.fulfill({
      status: 200,
      body: JSON.stringify({ posts, patrons }),
    });
  });
};

/**
 * Mock the Patreon API endpoint to return an error
 * @param window The Playwright Page object
 * @param status The HTTP status code to return
 * @param body The response body
 */
export const mockPatreonError = async (
  window: Page,
  status = 500,
  body = "Internal Server Error"
): Promise<void> => {
  await window.route("**/api/patreon", (route) => {
    return route.fulfill({
      status,
      body,
    });
  });
};

/**
 * Mock the last-updated API endpoint
 * @param window The Playwright Page object
 * @param offsetSeconds Optional offset in seconds to apply to the current time
 */
export const mockLastUpdated = async (
  window: Page,
  offsetSeconds = 0
): Promise<void> => {
  await window.route("**/api/last-updated", (route) => {
    return route.fulfill({
      status: 200,
      body: JSON.stringify(getMockLastUpdated(offsetSeconds)),
    });
  });
};

/**
 * Mock the last-updated API endpoint to return an error
 * @param window The Playwright Page object
 * @param status The HTTP status code to return
 * @param body The response body
 */
export const mockLastUpdatedError = async (
  window: Page,
  status = 500,
  body = "Internal Server Error"
): Promise<void> => {
  await window.route("**/api/last-updated", (route) => {
    return route.fulfill({
      status,
      body,
    });
  });
};

export const addPatronsToLocalStorage = async (
  window: Page,
  cachedPatrons: Patron[]
) => {
  // Set the cache with a very recent timestamp to ensure it's used
  await window.evaluate((patrons) => {
    localStorage.setItem(
      "patreon.patrons",
      JSON.stringify({
        age: Date.now(),
        content: patrons,
      })
    );
  }, cachedPatrons);
};

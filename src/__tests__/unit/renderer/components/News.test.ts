import { flushPromises, mount } from "@vue/test-utils";
import News from "../../../../renderer/src/components/News.vue";
import { injectStrict } from "../../../../renderer/src/services/service-container";
import { byTestId } from "../utils/test-utils";
import type { Post } from "../../../../renderer/src/services/posts.service";

jest.mock("../../../../renderer/src/services/service-container", () => ({
  injectStrict: jest.fn(),
  SERVICE_BINDINGS: {
    NEWS_SERVICE: Symbol("NEWS_SERVICE"),
  },
}));

const mockInjectStrict = injectStrict as jest.MockedFunction<
  typeof injectStrict
>;

const selectors = {
  newsContainer: byTestId("news-container"),
  newsError: byTestId("news-error"),
  newsLink: byTestId("news-link"),
  newsDate: byTestId("news-date"),
  newsTitle: byTestId("news-title"),
  newsItem: (title: string) => byTestId(`news-item-${title}`),
};

const mockPosts: Post[] = [
  {
    title: "Post One",
    content: "Content one",
    published: "2024-01-15T00:00:00Z",
    url: "/posts/post-one",
    tags: [],
  },
  {
    title: "Post Two",
    content: "Content two",
    published: "2024-02-20T00:00:00Z",
    url: "/posts/post-two",
    tags: [],
  },
];

describe("News #renderer #component", () => {
  let capturedUpdateNews: ((news: Post[]) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedUpdateNews = undefined;

    mockInjectStrict.mockReturnValue({
      getPosts: jest
        .fn()
        .mockImplementation((callback?: (news: Post[]) => void) => {
          capturedUpdateNews = callback;
          return Promise.resolve(mockPosts);
        }),
    });
  });

  const createWrapper = () =>
    mount(News, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true,
      },
    });

  describe("before posts load", () => {
    it("should not render the news container before posts load", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.newsContainer).exists()).toBe(false);
    });

    it("should not render the error message before posts load", () => {
      const wrapper = createWrapper();

      expect(wrapper.find(selectors.newsError).exists()).toBe(false);
    });
  });

  describe("when posts load successfully", () => {
    it("should render the news container when posts are loaded", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsContainer).exists()).toBe(true);
    });

    it("should render the correct number of news items", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findAll(selectors.newsLink)).toHaveLength(2);
    });

    it("should not render the error message when posts loaded successfully", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsError).exists()).toBe(false);
    });

    it("should render a BaseLink for each news item", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findAllComponents({ name: "BaseLink" })).toHaveLength(2);
    });

    it("should set the correct href on the first BaseLink", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findAllComponents({ name: "BaseLink" })[0]?.props("href")
      ).toBe("https://www.patreon.com/posts/post-one");
    });

    it("should set the correct href on the second BaseLink", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.findAllComponents({ name: "BaseLink" })[1]?.props("href")
      ).toBe("https://www.patreon.com/posts/post-two");
    });

    it("should display the formatted date for the first news item", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const expectedDate = new Date(
        "2024-01-15T00:00:00Z"
      ).toLocaleDateString();
      expect(wrapper.findAll(selectors.newsDate)[0]?.text()).toBe(expectedDate);
    });

    it("should display the formatted date for the second news item", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const expectedDate = new Date(
        "2024-02-20T00:00:00Z"
      ).toLocaleDateString();
      expect(wrapper.findAll(selectors.newsDate)[1]?.text()).toBe(expectedDate);
    });

    it("should display the title for the first news item", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findAll(selectors.newsTitle)[0]?.text()).toBe("Post One");
    });

    it("should display the title for the second news item", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findAll(selectors.newsTitle)[1]?.text()).toBe("Post Two");
    });

    it("should apply the correct data-testid to the first news item element", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsItem("Post One")).exists()).toBe(true);
    });

    it("should apply the correct data-testid to the second news item element", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsItem("Post Two")).exists()).toBe(true);
    });
  });

  describe("when posts load successfully but array is empty", () => {
    beforeEach(() => {
      mockInjectStrict.mockReturnValue({
        getPosts: jest.fn().mockResolvedValue([]),
      });
    });

    it("should not render the news container when posts array is empty", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsContainer).exists()).toBe(false);
    });

    it("should not render the error message when posts array is empty and no error occurred", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsError).exists()).toBe(false);
    });
  });

  describe("when posts fail to load", () => {
    beforeEach(() => {
      mockInjectStrict.mockReturnValue({
        getPosts: jest.fn().mockRejectedValue(new Error("Failed to fetch")),
      });
    });

    it("should render the error message when getPosts throws", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsError).exists()).toBe(true);
    });

    it("should not render the news container when getPosts throws", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(selectors.newsContainer).exists()).toBe(false);
    });
  });

  describe("updateNews callback", () => {
    const updatedPosts: Post[] = [
      {
        title: "Updated Post",
        content: "Updated content",
        published: "2024-03-01T00:00:00Z",
        url: "/posts/updated-post",
        tags: [],
      },
    ];

    it("should show the news container after updateNews is called with posts", async () => {
      mockInjectStrict.mockReturnValue({
        getPosts: jest
          .fn()
          .mockImplementation((callback?: (news: Post[]) => void) => {
            capturedUpdateNews = callback;
            return Promise.resolve([]);
          }),
      });

      const wrapper = createWrapper();
      await flushPromises();

      capturedUpdateNews?.(updatedPosts);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.newsContainer).exists()).toBe(true);
    });

    it("should render the correct number of items after updateNews is called", async () => {
      mockInjectStrict.mockReturnValue({
        getPosts: jest
          .fn()
          .mockImplementation((callback?: (news: Post[]) => void) => {
            capturedUpdateNews = callback;
            return Promise.resolve([]);
          }),
      });

      const wrapper = createWrapper();
      await flushPromises();

      capturedUpdateNews?.(updatedPosts);
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll(selectors.newsLink)).toHaveLength(1);
    });
  });
});

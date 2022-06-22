import { CacheService } from "@/renderer/services/cache.service";

export class PostsService {
  private news: Posts[] = [];
  private readonly cacheKey = "patreon.posts";
  private readonly cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  public async getPosts() {
    if (this.news.length === 0) {
      // Cache for 30 minutes. Ideally, the launcher should query an endpoint on the server to see if the cache is outdated.
      // However, this isn't available on the server yet.
      const data = this.cacheService.get<Posts[]>(this.cacheKey, 60 * 60 * 0.5);
      if (data !== undefined) {
        this.news = data;
      }
    }

    try {
      if (this.news.length > 0) {
        return this.news;
      }

      const response = await fetch("https://ultsky.phinocio.com/api/patreon");
      this.news = (await response.json()).posts as Posts[];
      this.cacheService.set(this.cacheKey, this.news);
      return this.news;
    } catch (error) {
      throw new Error(`Failed to get News: ${error}`);
    }
  }
}

export interface Posts {
  title: string;
  content: string;
  published: string;
  url: string;
  tags: string[];
}

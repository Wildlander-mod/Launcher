import { CacheService } from "@/renderer/services/cache.service";

export class PostsService {
  private news: Posts[] = [];
  private readonly cacheKey = "patreon.posts";
  private cacheService = new CacheService();

  constructor() {
    const data = this.cacheService.get<Posts[]>(this.cacheKey, 60 * 60 * 24);
    if (data !== undefined) {
      this.news = data;
    }
  }

  public async getPosts() {
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

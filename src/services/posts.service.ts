export class PostsService {
  private news: Posts[] = [];

  public async getPosts() {
    try {
      if (this.news.length > 0) {
        return this.news;
      }

      const response = await fetch("https://ultsky.phinocio.com/api/patreon");
      this.news = (await response.json()).posts as Posts[];
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

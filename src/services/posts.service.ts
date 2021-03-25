export class PostsService {
  public async getPosts() {
    try {
      const response = await fetch("https://ultsky.phinocio.com/api/patreon");
      return (await response.json()).posts as Posts[];
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

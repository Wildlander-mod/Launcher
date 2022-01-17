import { modpack } from "@/main/config";
export class PatreonService {
  private patrons: Patron[] = [];

  /**
   * Taken from https://stackoverflow.com/a/12646864/3379536
   */
  private static shuffleArray(array: Patron[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public async getPatrons(shuffle = true): Promise<Patron[]> {
    try {
      if (this.patrons.length > 0) {
        return this.patrons;
      }

      const response = await fetch(modpack.api);
      const data = (await response.json()) as { patrons: Patron[] };
      // Shuffle the array to show different Patrons each time
      this.patrons = shuffle
        ? PatreonService.shuffleArray(data.patrons)
        : data.patrons;
      return this.patrons;
    } catch (error) {
      throw new Error(`Failed to get Patrons: ${error}`);
    }
  }
}

export interface Patron {
  name: string;
  tier: "Patron" | "Super Patron";
}

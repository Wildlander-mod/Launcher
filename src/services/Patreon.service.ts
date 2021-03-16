export class PatreonService {
  public async getPatrons(shuffle = true): Promise<Patron[]> {
    try {
      const response = await fetch("https://ultsky.phinocio.com/api/patreon");
      const data = (await response.json()) as { patrons: Patron[] };
      // Shuffle the array to show different Patrons each time
      return shuffle ? PatreonService.shuffleArray(data.patrons) : data.patrons;
    } catch (error) {
      throw new Error(`Failed to get Patrons: ${error}`);
    }
  }

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
}

export interface Patron {
  name: string;
  tier: "Patron" | "Super Patron";
}

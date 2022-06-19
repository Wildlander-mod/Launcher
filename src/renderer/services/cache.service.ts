import { logger } from "@/main/logger";

/**
 * The CacheService class is a simple wrapper around window.localStorage
 * localStorage can only store strings so this wrapper JSON.stringifies all data
 */
export class CacheService {
  /**
   * Returns data from the localStorage if it exists and is newer than maxAge
   */
  public get<T>(key: string, maxAge: number): T | undefined {
    maxAge *= 1000; // convert s to ms for comparison
    const now = new Date();
    logger.debug(`Cache: query "${key}" with maxAge: ${maxAge}.`);
    const rawData = window.localStorage.getItem(key);
    if (rawData !== null) {
      const data: { age: number; content: T } = JSON.parse(rawData);
      if (now.getTime() - data.age < maxAge) {
        logger.debug(`Cache: returning data for "${key}"`);
        return data.content;
      }
    }
    logger.debug(`Cache: could not find "${key}" in cache or too old`);
    return undefined;
  }

  /**
   * Sets data in the localStorage, overwrites regardless of previous data presence
   */
  public set(key: string, data: unknown) {
    logger.debug(`Cache: setting data for "${key}".`);
    window.localStorage.setItem(
      key,
      JSON.stringify({
        age: new Date().getTime(),
        content: data,
      })
    );
  }
}

import { logger } from "@/main/logger";

/**
 * The CacheService class is a simple wrapper around window.localStorage
 * localStorage can only store strings so this wrapper JSON.stringifies all data
 */
export class CacheService {
  /**
   * Returns data from the localStorage if it exists and is newer than maxAge
   */
  public get<T>(
    key: string,
    maxAge?: number
  ): { age: number; content: T } | undefined {
    const now = new Date();
    logger.debug(
      `Cache: query "${key}" with maxAge: ${maxAge || "unlimited"} seconds.`
    );
    const rawData = window.localStorage.getItem(key);
    if (rawData !== null) {
      const data: { age: number; content: T } = JSON.parse(rawData);
      // Convert maxAge to ms for comparison
      if (!maxAge || now.getTime() - data.age < maxAge * 1000) {
        logger.debug(`Cache: returning data for "${key}"`);
        return data;
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

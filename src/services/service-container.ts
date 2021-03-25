import { inject, InjectionKey, provide } from "vue";
import { PatreonService } from "./Patreon.service";
import { PostsService } from "@/services/posts.service";

/*
 * IoC container to handle injecting services into Vue components
 */

/**
 * Create a new typed binding key
 */
function createBinding<T>(key: string): InjectionKey<T> {
  return Symbol(key);
}

/**
 * Available keys to access services from the IoC container
 */
export const SERVICE_BINDINGS = {
  PATRON_SERVICE: createBinding<PatreonService>("keys.services.patron"),
  NEWS_SERVICE: createBinding<PostsService>("keys.services.news")
};

/**
 * Register all services
 */
export function registerServices() {
  provide(SERVICE_BINDINGS.PATRON_SERVICE, new PatreonService());
  provide(SERVICE_BINDINGS.NEWS_SERVICE, new PostsService());
}

/**
 * Used when it makes sense to error if the injection doesn't exist
 * Useful for services as the application likely won't work without these
 */
export function injectStrict<T>(key: InjectionKey<T>, fallback?: T) {
  const resolved = inject(key, fallback);
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`);
  }

  return resolved;
}

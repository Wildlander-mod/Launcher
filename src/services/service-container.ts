import { inject, InjectionKey, provide } from "vue";
import { PatreonService } from "./Patreon.service";

function createBinding<T>(key: string): InjectionKey<T> {
  return Symbol(key);
}

export const SERVICE_BINDINGS = {
  PATRON_SERVICE: createBinding<PatreonService>("keys.services.patron")
};

export function registerServices() {
  provide(SERVICE_BINDINGS.PATRON_SERVICE, new PatreonService());
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

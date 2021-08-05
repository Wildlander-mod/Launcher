import { inject, InjectionKey, provide } from "vue";
import { PatreonService } from "./patreon.service";
import { PostsService } from "@/services/posts.service";
import mitt, { Emitter, EventType } from "mitt";
import { ModalService } from "@/services/modal.service";

export type EventService = Emitter<Record<EventType, unknown>>;

/*
 * IoC container to handle injecting services into Vue components
 */

/**
 * Create a new typed binding key
 */
export function createBinding<T>(key: string): InjectionKey<T> {
  return Symbol(key);
}

/**
 * Available keys to access services from the IoC container
 */
export const SERVICE_BINDINGS = {
  PATRON_SERVICE: createBinding<PatreonService>("keys.services.patron"),
  NEWS_SERVICE: createBinding<PostsService>("keys.services.news"),
  EVENT_SERVICE: createBinding<EventService>("keys.services.event"),
  MODAL_SERVICE: createBinding<ModalService>("keys.services.modal"),
};

/**
 * Register all services
 */
export function registerServices() {
  provide(SERVICE_BINDINGS.PATRON_SERVICE, new PatreonService());
  provide(SERVICE_BINDINGS.NEWS_SERVICE, new PostsService());

  const eventService = mitt();
  provide(SERVICE_BINDINGS.EVENT_SERVICE, eventService);

  provide(SERVICE_BINDINGS.MODAL_SERVICE, new ModalService(eventService));

  return {
    eventService,
  };
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

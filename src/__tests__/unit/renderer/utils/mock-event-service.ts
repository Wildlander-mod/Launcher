import type { EventService } from "@/renderer/src/services/service-container";
import type { EventType } from "mitt";

/**
 * Creates a mock EventService for testing renderer components.
 *
 * Purpose:
 * - Captures event callbacks registered via `on()` method
 * - Allows manual triggering of these callbacks in tests via `trigger()` method
 * - Provides a jest mock for `emit()` to verify event emissions
 *
 * How it works:
 * 1. When component calls `eventService.on(event, callback)`, the callback is stored
 * 2. In tests, call `mockEventService.trigger(event, ...args)` to invoke stored callbacks
 * 3. This simulates the event being emitted and allows testing component reactions
 *
 * @example
 * ```typescript
 * const mockEventService = createMockEventService();
 * mockInjectStrict.mockReturnValue(mockEventService);
 *
 * // Component registers listener during mount
 * mount(MyComponent);
 *
 * // Test triggers the event
 * mockEventService.trigger('modalOpened', true);
 * ```
 */
export function createMockEventService(): EventService & {
  trigger: (event: EventType, ...args: unknown[]) => void;
} {
  // Store callbacks registered via on() method, keyed by event name
  const listeners = new Map<EventType, Array<(...args: unknown[]) => void>>();

  return {
    // Capture callbacks when component registers event listeners
    on: jest.fn((event: EventType, callback: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(callback);
    }) as EventService["on"],
    // Mock emit for verifying component emits events
    emit: jest.fn() as EventService["emit"],
    // Mock off and all methods
    off: jest.fn() as EventService["off"],
    all: new Map(),
    // Manually trigger captured callbacks in tests
    trigger(event: EventType, ...args: unknown[]) {
      listeners.get(event)?.forEach((callback) => callback(...args));
    },
  };
}

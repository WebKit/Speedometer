import type { ReactiveElement } from "lit";

interface ListenerCarryingElement extends ReactiveElement {
    // This property will be used by the decorator to store the event listener.
    // It can be dynamically added or explicitly declared by the class using the decorator.
    __updateOnEventListener?: () => void;
}

/**
 * An accessor decorator that subscribes to an event on the property value and
 * calls `requestUpdate` when the event fires.
 * 
 * The accessor type must be an `EventTarget`.
 */
export const updateOnEvent = (eventName: string) =>
  function <T extends ListenerCarryingElement, V extends EventTarget | undefined>(
    target: ClassAccessorDecoratorTarget<T, V>,
    _context: ClassAccessorDecoratorContext<T, V>
  ) {
    const {get, set} = target;

    return {
      get(this: T): V {
        return get.call(this);
      },
      set(this: T, newValue: V): void {
        const listener = this.__updateOnEventListener ??= () => this.requestUpdate();
        const oldValue = get.call(this);
        oldValue?.removeEventListener(eventName, listener);
        newValue?.addEventListener(eventName, listener);
        set.call(this, newValue);
      }
    };
  };
  
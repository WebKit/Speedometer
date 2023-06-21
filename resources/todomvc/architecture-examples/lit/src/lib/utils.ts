import { ReactiveElement } from "lit";

interface ListenerCarryingElement extends ReactiveElement {
	__updateOnEventListener?: () => void;
}

/**
 * A property decorator that subscribes to an event on the property value and
 * calls `requestUpdate` when the event fires.
 *
 * If we were using this outside of just this one app we'd use the type system
 * to enforce that the property value is an `EventTarget`.
 */
export const updateOnEvent =
	(eventName: string) =>
	(target: ListenerCarryingElement, propertyKey: string) => {
		const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey)!;
		if (
			descriptor == null ||
			descriptor.get == null ||
			descriptor.set == null
		) {
			throw new Error(
				`updateOnEvent should only be called on an accessor, ` +
					`but ${propertyKey} did not have both a getter and setter`
			);
		}
		const { get, set } = descriptor;
		const newDescriptor = {
			...descriptor,
			set(this: ListenerCarryingElement, v: EventTarget) {
				const listener = (this.__updateOnEventListener ??= () =>
					this.requestUpdate());
				const oldValue = get!.call(this);
				oldValue?.removeEventListener?.(eventName, listener);
				v?.addEventListener?.(eventName, listener);
				return set!.call(this, v);
			},
		};
		Object.defineProperty(target, propertyKey, newDescriptor);
	};

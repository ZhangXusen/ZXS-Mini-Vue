import { camelize, capitalize } from "../shared";

export function emit(instance, eventName, ...args) {
	const { props } = instance;
	// add-->Add
	// add-foo--> AddFoo

	const handlers = props["on" + camelize(capitalize(eventName))];
	handlers && handlers(...args);
}

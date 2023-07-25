import { createRenderer } from "../runtime-core";

export function createElement(type) {
	return document.createElement(type);
}
export function patchProps(el, key, value) {
	const isOn = (key: string) => /^on[A-Z]/.test(key);
	if (isOn(key)) {
		//prop为事件
		const eventName = key.slice(2).toLocaleLowerCase;
		el.addEventListener(eventName, value);
	} else {
		//prop为属性
		el.setAttribute(key, value);
	}
}
export function Insert(el, parent) {
	parent.append(el);
}
export const render: any = createRenderer({
	createElement,
	patchProps,
	Insert,
});
export function createApp(...args) {
	return render.createApp(...args);
}
export * from "../runtime-core/index";

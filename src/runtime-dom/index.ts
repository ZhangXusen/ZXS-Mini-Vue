import { createRenderer } from "../runtime-core";

export function createElement(type) {
	return document.createElement(type);
}
export function Remove(child) {
	const parent = child.parentNode;
	if (parent) {
		parent.removeChild(child);
	}
}
export function setElementText(container, text) {
	container.setElementText(text);
}
export function patchProps(el, key, oldValue, newValue) {
	const isOn = (key: string) => /^on[A-Z]/.test(key);
	if (isOn(key)) {
		//prop为事件
		const eventName = key.slice(2).toLocaleLowerCase;
		el.addEventListener(eventName, newValue);
	} else {
		//prop为属性
		//如果新的属性的值为null或undefined则删除该属性
		if (newValue === undefined || newValue === null) {
			el.removeAttribute(key);
		} else {
			el.setAttribute(key, newValue);
		}
	}
}
export function Insert(el, parent, anchor) {
	//将元素添加到指定元素之前，如果锚点为null，则在后面追加。
	parent.insertBefore(el, anchor || null);
}
export const render: any = createRenderer({
	createElement,
	patchProps,
	Insert,
	Remove,
	setElementText,
});
export function createApp(...args) {
	return render.createApp(...args);
}
export * from "../runtime-core/index";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:22:34
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-27 16:37:52
 */
import { ShapeFlags } from "./shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type, props?, children?) {
	const vNode = {
		type,
		props,
		children,
		el: null,
		shapeFlag: getShapeFlag(type),
		key: props && props.key,
		component: null,
	};
	if (typeof children === "string") {
		vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
	} else if (Array.isArray(children)) {
		vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
	}
	if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		if (typeof children === "object") {
			vNode.shapeFlag = ShapeFlags.SLOTS_CHILDREN;
		}
	}
	return vNode;
}
function getShapeFlag(type: any) {
	return typeof type === "string"
		? ShapeFlags.ELEMENT
		: ShapeFlags.STATEFUL_COMPONENT;
}

/**
 * @description: 创建单纯的文本节点
 * @param {string} string
 * @return {*}
 * @author: 小国际
 */
export function createTextVNode(string: string) {
	return createVNode(Text, {}, string);
}

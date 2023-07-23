import { ShapeFlags } from "./shapeFlags";

export function createVNode(type, props?, children?) {
	const vNode = {
		type,
		props,
		children,
		el: null,
		shapeFlag: getShapeFlag(type),
	};
	if (typeof children === "string") {
		vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
	} else if (Array.isArray(children)) {
		vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
	}
	return vNode;
}
function getShapeFlag(type: any) {
	return typeof type === "string"
		? ShapeFlags.ELEMENT
		: ShapeFlags.STATEFUL_COMPONENT;
}

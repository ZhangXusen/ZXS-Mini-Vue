import { ShapeFlags } from "./shapeFlags";

export function initSlots(instance, children) {
	//确保children是个数组
	// instance.slots = Array.isArray(children) ? children : [children];
	//slot使object
	const { vNode } = instance;
	const slots = {};
	// {
	// 	footer: h("div", {}, "123");
	//  header: h("div", {}, "456")
	// }
	//如果该虚拟节点为插槽
	if (vNode.shapeFlag === ShapeFlags.SLOTS_CHILDREN) {
		for (const name in children) {
			const slot = children[name];
			slots[name] = (props) => (Array.isArray(slot(props)) ? slot : [slot]);
		}
		instance.slots = slots;
	}
}

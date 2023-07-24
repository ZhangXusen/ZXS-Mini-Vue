import { Fragment, createVNode } from "../vnode";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-23 20:50:30
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-23 22:17:36
 */
export function renderSlots(slots, name, props) {
	const slot = slots[name];
	if (slot) {
		if (typeof slot === "function") {
			return createVNode(Fragment, {}, slot(props));
		}
	}
}

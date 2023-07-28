import { hasOwn } from "../shared";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-20 18:12:51
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-27 16:10:40
 */
const PublicPropertiesMap = {
	$el: (i) => i.vNode.el,
	$slots: (i) => i.vNode.slots,
	$props: (i) => i.vNode.props,
};

export const PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		//获取setup里的状态
		const { setupState, props } = instance;

		if (hasOwn(setupState, key)) {
			//如果setup中有这个属性，则直接返回
			return setupState[key];
		} else if (hasOwn(props, key)) {
			//如果组件的props中有这个属性，也直接返回
			return props[key];
		}
		// if (key === "$el") {
		// 	return instance.vNode.el;
		// }
		const publicGetter = PublicPropertiesMap[key];
		if (publicGetter) {
			return publicGetter(instance);
		}
	},
};

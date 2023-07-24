import { getCurrentInstance } from "./component";

/**
 * @description: provider API 存数据
 * @param {*} key
 * @param {*} value
 * @return {*}
 * @author: 小国际
 */
export function provide(key, value) {
	const currentInstance: any = getCurrentInstance();
	if (currentInstance) {
		let { provides } = currentInstance;

		const parentProvides = currentInstance.parent.provides;

		if (provides === parentProvides) {
			//使当前组件的provides的原型指向其父级provides
			provides = currentInstance.provides = Object.create(parentProvides);
			//使用了provide()的组件，其provides的原型(prototype)指向其父级。
			//未使用该函数的组件，provides则直接指向父级。
		}
		provides[key] = value;
	}
}
/**
 * @description: inject API 取数据
 * @param {*} key
 * @return {*}
 * @author: 小国际
 */
export function inject(key, defaultValue) {
	const currentInstance: any = getCurrentInstance();
	if (currentInstance) {
		const parentProvides = currentInstance.parent.provides;
		if (key in parentProvides) {
			return parentProvides[key];
		} else if (defaultValue) {
			if (typeof defaultValue === "function") {
				return defaultValue();
			} else {
				return defaultValue;
			}
		}
	}
}

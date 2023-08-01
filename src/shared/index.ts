export const extend = Object.assign;
export const isObject = (obj) => obj !== null && typeof obj == "object";
export const hasChanged = (value, newValue) => !Object.is(value, newValue);
/**
 * @description: 判断obj对象是否有key属性
 * @param {any} obj
 * @param {any} key
 * @return {*}
 * @author: 小国际
 */
export function hasOwn(obj: any, key: any) {
	return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * @description: 首字母大写
 * @param {string} str
 * @return {*}
 * @author: 小国际
 */
export const capitalize = (str: string) =>
	str.charAt(0).toUpperCase() + str.slice(1);

export const camelize = (str: string) =>
	str.replace(/-(\w)/g, (_, c) => {
		return c ? c.toUpperCase() : "";
	});

export const isString = (str: string) => typeof str === "string";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-06-30 15:41:05
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-22 20:51:12
 */
import { isObject } from "../shared";
import {
	mutableHandlers,
	readonlyHandlers,
	shallowReadonlyHandlers,
} from "./baseHandlers";
import { track, trigger } from "./effect";

export const enum ReactiveFlags {
	IS_REACTIVE = "__v_isReactive",
	IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
	return createReactiveObject(raw, mutableHandlers);
	// return new Proxy(
	// 	raw,
	// 	mutableHandlers
	// 	//{
	// 	// get(target, key) {
	// 	// 	//target:代理的对象
	// 	// 	//key:要get的代理对象的属性
	// 	// 	const res = Reflect.get(target, key);
	// 	// 	//TODO 依赖收集
	// 	// 	track(target, key);
	// 	// 	return res;
	// 	// },
	// 	// get: createGetter(),
	// 	// set(target, key, value) {
	// 	// 	const res = Reflect.set(target, key, value);
	// 	// 	//TODO 触发依赖
	// 	// 	trigger(target, key, value);
	// 	// 	return res;
	// 	// },
	// 	// set: createSetter(),

	// 	//}
	// );
}

//readonly不能set,没有track()
export function readonly(raw) {
	return createReactiveObject(raw, readonlyHandlers);
	// return new Proxy(
	// 	raw,
	// 	readonlyHandlers
	// 	// {
	// 	// 	// get(target, key) {
	// 	// 	// 	const res = Reflect.get(target, key);
	// 	// 	// 	return res;
	// 	// 	// },
	// 	// 	get: createGetter(true),
	// 	// 	// set(target, key, value) {
	// 	// 	// 	throw new Error("readonly不可被更改");
	// 	// 	// },
	// 	// 	set: createSetter(),
	// 	// }
	// );
}
export function shallowReadonly(raw) {
	return createReactiveObject(raw, shallowReadonlyHandlers);
}

function createReactiveObject(raw: any, baseHandlers) {
	if (isObject(raw)) {
		console.warn(raw + " 要是一个对象");
		return raw;
	}
	return new Proxy(raw, baseHandlers);
}

//原理:触发一个get "is_reactive"属性操作,在 Proxy handler里对 get "is_reactive"做单独判断.
export function isReactive(target) {
	//如果没有is_reactive属性或者is_reactive为false(只读) 则返回false.
	// !! 将结果强制转换成boolean
	return !!target[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(target) {
	return !!target[ReactiveFlags.IS_READONLY];
}

export function isProxy(target) {
	return isReadonly(target) || isReactive(target);
}

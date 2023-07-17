/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-17 16:01:42
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-17 18:05:01
 */

import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
	//保存经过reactive包装后的value
	private _value: any;
	//保存原始value
	private _rawValue: any;
	//dep保存所有effect
	public dep: any;
	//标识
	public __v_isRef = true;
	constructor(value) {
		this._rawValue = value;
		//是否为对象：是则reactive
		this._value = convert(value);
		this.dep = new Set();
	}
	get value() {
		if (isTracking()) {
			trackEffect(this.dep);
		}
		return this._value;
	}
	set value(newValue) {
		this._rawValue = newValue;
		//值改变了才触发依赖，避免性能浪费
		if (!hasChanged(this._value, this._rawValue)) return;
		this._rawValue = newValue;
		this._value = convert(newValue);
		triggerEffect(this.dep);
	}
}
/**
 * @description:用户使用ref函数包装对象或基本类型
 * @param {*} value
 * @return {*}
 * @author: 小国际
 */
export function ref(value) {
	const Ref = new RefImpl(value);

	return Ref;
}

/**
 * @description: 将普通value转换为reactive包装后的value
 * @param {*} value
 * @return {*}
 * @author: 小国际
 */
export function convert(value) {
	return isObject(value) ? reactive(value) : value;
}

/**
 * @description: 判断该对象是否为Ref对象:
 * 在Ref对象中添加__v_isRef标识。
 * 如果读取到了就是Ref对象，
 * 读取不到就不是。
 * @param {*} refObj 目标对象
 * @return {boolean}
 * @author: 小国际
 */
export function isRef(refObj) {
	return !!refObj.__v_isRef;
}

/**
 * @description:
 * 先判断是否为Ref对象，
 * 是则返回ref.value
 * 否则直接返回该对象
 * @param {*} ref
 * @return {ref}
 * @author: 小国际
 */
export function unRef(ref) {
	return isRef(ref) ? ref.value : ref;
}

/**
 * @description:
 * @param {*} objectWithRefs
 * @return {*}
 * @author: 小国际
 */
export function proxyRefs(objectWithRefs) {
	return new Proxy(objectWithRefs, {
		get(target, key) {
			//Ref对象-》.value
			//普通对象-》直接返回
			return unRef(Reflect.get(target, key));
		},
		//更改proxyRefs后对象的属性的值。要使其Ref性不变
		set(target, key, value) {
			//如果,该属性原本为ref类型,且新值也是ref类型，则直接替换
			if (isRef(target[key]) && !isRef(value)) {
				return (target[key].value = value);
			} else {
				return Reflect.set(target, key, value);
			}
		},
	});
}

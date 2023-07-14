import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
//重构get,set更具通用性.
function createGetter(isReadonly = false) {
	return function get(target, key) {
		const res = Reflect.get(target, key);
		//是对象的话就转为响应式
		if (isObject(res)) {
			return isReadonly ? readonly(res) : reactive(res);
		}
		//非只读,则可以触发track()
		if (!isReadonly) {
			track(target, key);
		}
		//判断是否为reactive
		if (key === ReactiveFlags.IS_REACTIVE) {
			return !isReadonly;
		}
		//判断isReadonly
		else if (key === ReactiveFlags.IS_READONLY) {
			return isReadonly;
		}
		return res;
	};
}

function createSetter() {
	return function set(target, key, value) {
		const res = Reflect.set(target, key, value);
		trigger(target, key, value);
		return res;
	};
}
export const mutableHandlers = {
	get,
	set,
};

export const readonlyHandlers = {
	readonlyGet,
	set(target, key, value) {
		console.warn(`${key} set失败 ,因为target为readonly的`);
		return true;
	},
};

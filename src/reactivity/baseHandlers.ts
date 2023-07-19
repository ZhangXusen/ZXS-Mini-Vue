import { isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
//重构get,set更具通用性.
function createGetter(isReadonly = false, isShallow = false) {
	return function get(target, key) {
		//判断是否为reactive
		if (key === ReactiveFlags.IS_REACTIVE) {
			return !isReadonly;
		} else if (key === ReactiveFlags.IS_READONLY) {
			//判断isReadonly
			return isReadonly;
		}
		const res = Reflect.get(target, key);
		//非只读,则可以触发track()，只读只有get,无set所以不能触发trigger()
		if (!isReadonly) {
			track(target, key);
		}
		//浅层响应式
		if (isShallow) {
			return res;
		}
		//是对象的话就转为响应式
		if (isObject(res)) {
			return isReadonly ? readonly(res) : reactive(res);
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
	get: readonlyGet,
	//readonly的数据不可更改
	set(target, key, value) {
		console.warn(`${key} set失败 ,因为target为readonly的`);
		return true;
	},
};

//shallow
export const shallowReadonlyHandlers = {
	get: shallowReadonlyGet,
	set(target, key, value) {
		console.warn(`${key} set失败 ,因为target为readonly的`);
		return true;
	},
};

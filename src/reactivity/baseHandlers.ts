import { track, trigger } from "./effect";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
//重构get,set更具通用性.
function createGetter(isReadonly = false) {
	return function get(target, key) {
		const res = Reflect.get(target, key);
		//非只读,则可以触发track()
		if (!isReadonly) {
			track(target, key);
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

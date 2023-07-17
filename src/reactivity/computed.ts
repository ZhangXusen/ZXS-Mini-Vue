import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
	private _getter: any;
	private _dirty: boolean = true;
	private _value: any;
	private _effect: any;
	constructor(getter) {
		this._getter = getter;
		this._effect = new ReactiveEffect(getter, () => {
			//打开开关
			if (!this._dirty) {
				this._dirty = true;
			}
		});
	}
	get value() {
		//第一次执行，执行getter，并保存其结果
		if (this._dirty) {
			this._dirty = false;
			this._value = this._effect.run();
		}
		//返回缓存值
		return this._value;
	}
}
export function computed(getter) {
	return new ComputedRefImpl(getter);
}

import { extend } from "../shared";

//定义全局变量,使每个effect加入到dep中,由此可以调用fn()
//表示每个执行的effect,每次响应式更新后,就将本次执行的effect放入dep,去重.

let activeEffect;
let shouldTrack;
class ReactiveEffect {
	private _fn: any;
	public scheduler: Function | undefined;
	deps = [];
	active = true;
	onStop?: () => void;
	constructor(fn, scheduler?: Function) {
		this._fn = fn;
		this.scheduler = scheduler;
	}
	//执行fn
	run() {
		if (!this.active) {
			return this._fn();
		}
		shouldTrack = true;
		activeEffect = this;
		const result = this._fn();
		shouldTrack = false;
		return result;
	}
	stop() {
		if (this.active) {
			cleanupEffect(this);
			//触发stop时的回调
			if (this.onStop) {
				this.onStop();
			}
			this.active = false;
		}
	}
}

//缓存所有代理对象
//一个targetMap有多个target,
//一个target有多个key
//一个key有多个dep
const targetMap = new Map();
//收集effect()依赖
export function track(target, key) {
	if (!isTracking()) return;
	//targetMap-->target-->key-->dep
	let depsMap = targetMap.get(target);
	// 初始化depsMap
	if (!depsMap) {
		depsMap = new Map();
		targetMap.set(target, depsMap);
	}
	let dep = depsMap.get(key);
	//初始化dep
	if (!dep) {
		dep = new Set();
		depsMap.set(key, dep);
	}

	//effect已经在dep中了,就没必要添加进去了.
	if (dep.has(activeEffect)) return;
	dep.add(activeEffect);
	activeEffect.deps.push(dep);
}

//触发依赖中的effect()以此更新数据
export function trigger(target: any, key: any, value: any) {
	let depsMap = targetMap.get(target);
	let dep = depsMap.get(key);
	//遍历dep,执行每个effect
	for (const effect of dep) {
		//更新时,有scheduler则触发,否则触发run()
		if (effect.scheduler) {
			effect.scheduler();
		} else {
			effect.run();
		}
	}
}

//取消响应式
//原理:把effect从deps中删除
export function stop(runner) {
	runner.effect.stop();
}
// 把effect从deps中删除的具体实现函数
function cleanupEffect(effect) {
	effect.deps.forEach((dep: any) => {
		dep.delete(effect);
	});
	effect.deps.length = 0;
}

//是否在收集依赖
function isTracking() {
	return shouldTrack && activeEffect !== undefined;
}
export function effect(fn, options: any = {}) {
	const _effect = new ReactiveEffect(fn, options.scheduler);

	// _effect.onStop = options.onStop;
	// _effect.run();
	//将options合并到effect上的优化
	// Object.assign(_effect, options);
	//将上面的抽离到了share工具类中
	extend(_effect, options);
	_effect.run();
	const runner: any = _effect.run.bind(_effect);
	// 把effect挂载到runner上,这样runner就可以使用effect里的方法了
	runner.effect = _effect;
	return runner;
}

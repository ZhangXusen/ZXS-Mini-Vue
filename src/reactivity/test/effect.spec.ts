import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
	it.skip("happy path", () => {
		const user = reactive({
			age: 10,
		});
		let nextAge;
		effect(() => {
			nextAge = user.age + 1;
		});
		expect(nextAge).toBe(11);
		//数值更新，希望触发effect()
		user.age++;
		expect(nextAge).toBe(12);
	});

	it("should return runner", () => {
		let foo = 10;
		const runner = effect(() => {
			foo++;
			return "foo";
		});
		expect(foo).toBe(11);
		const r = runner();
		expect(foo).toBe(12);
		expect(r).toBe("foo");
	});

	it("scheduler", () => {
		//1.通过 effect 的第二个参数给定的一个 scheduler 的fn
		//2.effect第一次执行时,还会执行fn
		//3.当响应式对象set,update时,不会执行fn,而是执行scheduler
		//4.如果说 当执行runner时,会再次执行fn
		let dummy;
		let run: any;
		const scheduler = jest.fn(() => {
			run = runner;
		});
		const obj = reactive({ foo: 1 });
		const runner = effect(
			() => {
				dummy = obj.foo;
			},
			{ scheduler }
		);
		//断言一开始不会被调用
		expect(scheduler).not.toHaveBeenCalled();
		expect(dummy).toBe(1);
		//断言当响应式值发生改变时,不会调用effect的第一个参数,
		// 而是会调用scheduler
		// should be called on first trigger
		obj.foo++;
		expect(scheduler).toHaveBeenCalledTimes(1);
		// should not run yet
		expect(dummy).toBe(1);
		// manually run
		run();
		// should have run
		expect(dummy).toBe(2);
	});

	//取消响应式功能
	it("stop", () => {
		let dummy;
		const obj = reactive({ prop: 1 });
		const runner = effect(() => {
			dummy = obj.prop;
		});
		obj.prop = 2;
		expect(dummy).toBe(2);
		stop(runner);
		obj.prop = 3;
		expect(dummy).toBe(2);

		// stopped effect should still be manually callable
		runner();
		expect(dummy).toBe(3);
	});
	//调用stop后的回调函数
	it("events: onStop", () => {
		const obj = reactive({ prop: 1 });
		const onStop = jest.fn();
		let dummy;
		const runner = effect(
			() => {
				dummy = obj.foo;
			},
			{
				onStop,
			}
		);

		stop(runner);
		expect(onStop).toHaveBeenCalled();
	});
});

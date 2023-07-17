import { isReactive, isReadonly, readonly } from "../reactive";

//readonly不可以被改写(set)
describe("readonly", () => {
	it("happy path", () => {
		const original = { foo: 1, bar: { baz: 2 } };
		const observed = readonly(original);
		expect(observed).not.toBe(original);
		expect(observed.foo).toBe(1);
		//测试isReactive功能
		expect(isReactive(observed)).toBe(false);
		expect(isReactive({ a: 1 })).toBe(false);
		//测试isReadonly功能
		expect(isReadonly(observed)).toBe(true);

		expect(isReactive(original)).toBe(false);
		expect(isReadonly(original)).toBe(false);
		expect(isReactive(original.bar)).toBe(false);
		expect(isReadonly(original.bar)).toBe(false);
	});
});

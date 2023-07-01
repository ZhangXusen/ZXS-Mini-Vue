import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
	it("happy path", () => {
		const original = { foo: 1 };
		const observed = reactive(original);
		//来验证源对象与响应式后的对象不相等
		expect(observed).not.toBe(original);
		//用来验证响应式对象与和源对象的一致性
		expect(observed.foo).toBe(1);
		expect(isReactive(observed)).toBe(true);
	});
});

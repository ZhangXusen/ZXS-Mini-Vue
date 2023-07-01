import { readonly } from "../reactive";

//readonly不可以被改写(set)
describe("readonly", () => {
	it("happy path", () => {
		const original = { foo: 1, bar: { baz: 2 } };
		const observed = readonly(original);
		expect(observed).not.toBe(original);
		expect(observed.foo).toBe(1);
	});
});

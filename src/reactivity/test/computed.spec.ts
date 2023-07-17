/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-17 18:12:10
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-17 20:19:09
 */
import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
	it("happy path", () => {
		const user = reactive({
			age: 1,
		});

		const age = computed(() => {
			return user.age;
		});
		expect(age.value).toBe(1);
	});

	it("should compute lazily", () => {
		const value = reactive({
			foo: 1,
		});
		const getter = jest.fn(() => {
			return value.foo;
		});
		const cValue = computed(getter);

		// lazy：如果未使用cValue，则不会触发getter
		expect(getter).not.toHaveBeenCalled();

		expect(cValue.value).toBe(1);
		expect(getter).toHaveBeenCalledTimes(1); //使用cValue后，getter被调用1次

		// should not compute again
		cValue.value;
		expect(getter).toHaveBeenCalledTimes(1);

		// should not compute until needed
		value.foo = 2;
		expect(getter).toHaveBeenCalledTimes(1);

		// now it should compute
		expect(cValue.value).toBe(2);
		expect(getter).toHaveBeenCalledTimes(2);

		// should not compute again
		cValue.value;
		expect(getter).toHaveBeenCalledTimes(2);
	});
});

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-22 17:23:14
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-22 21:56:35
 */
export const Foo = {
	setup(props, { emit }) {
		// props={
		//  count:xxxx
		// }
		const emitAdd = () => {
			console.log("emit add");
			emit("add", "1", 2);
		};
		console.log(props);

		return {
			emitAdd,
		};
	},
	render() {
		const btn = h(
			"button",
			{
				onClick: this.emitAdd,
			},
			"emitAdd"
		);
		const foo = h("p", {}, "foo");
		return h("div", {}, [foo, btn]);
	},
};

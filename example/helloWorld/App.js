import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
	render() {
		//ui
		return h(
			"div",
			{
				id: "root",
				class: ["red", "hard"],
				onClick() {
					console.log("click");
				},
			},
			[
				h("div", {}, "hi" + this.msg),
				h(Foo, {
					count: 1,
					onAdd(a, b) {
						console.log("onAdd", a, b);
					},
				}),
			]
			// [h("p", { class: "red" }, "hi"), h("p", { class: "green" }, "mini-vue")]
		);
	},
	setup() {
		return {
			msg: "mini-vue",
		};
	},
};

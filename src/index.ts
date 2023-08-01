/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-19 15:15:28
 * @LastEditors: 小国际
 * @LastEditTime: 2023-08-01 21:58:22
 */
export * from "./reactivity";
export * from "./runtime-dom";
import { baseCompile } from "./compiler-core/src";
import * as runtimeDOM from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";
function compileToFunction(template) {
	const { code } = baseCompile(template, {});
	const render = new Function("Vue", code)(runtimeDOM);
	return render;
}

registerRuntimeCompiler(compileToFunction);

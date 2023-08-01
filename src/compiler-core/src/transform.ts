import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
	const context = createTransformContext(root, options);
	//1.遍历搜索DFS
	//2.遍历时修改content
	DFS(root, context);

	//root.codegenNode
	createCodeGenNode(root);
	root.helpers = [...context.helpers.keys()];
}
function DFS(node: any, context: any) {
	console.log("node:" + node);
	const nodeTransforms = context.nodeTransforms;
	//执行所有用户传入的Plugin
	for (let i = 0; i < nodeTransforms.length; i++) {
		const CustomTransform = nodeTransforms[i];
		CustomTransform(node);
	}

	//
	switch (node.type) {
		case NodeTypes.INTERPOLATION:
			context.helper(TO_DISPLAY_STRING);
			break;
		case NodeTypes.ROOT:
		case NodeTypes.ELEMENT:
			traverseChildren(node, context);
		default:
			break;
	}
}
function traverseChildren(node: any, context: any) {
	//处理所有子节点
	const children = node.children;
	if (children) {
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			DFS(node, context);
		}
	}
}
function createTransformContext(root: any, options: any) {
	const context = {
		root,
		nodeTransforms: options.nodeTransforms || [],
		helpers: new Map(),
		helper(key) {
			context.helpers.set(key, 1);
		},
	};
	return context;
}
/**
 * @description: 将children[0]拆封到root.codegenNode。方便generate调用
 * @param {any} root
 * @return {*}
 * @author: 小国际
 */
function createCodeGenNode(root: any) {
	root.codegenNode = root.children[0];
}
